// Agencja Cyfrowych Detektywów – program startowy (portable, bez instalacji).
// Przy starcie pobiera z GitHuba manifest.json, dociąga zmienione materiały
// do profilu ucznia (%LOCALAPPDATA%) i pokazuje menu klas.
// Kompilacja: narzedzia\zbuduj-aplikacje.bat (używa csc.exe z .NET Framework 4, jest w każdym Windows).
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

[assembly: AssemblyTitle("Agencja Cyfrowych Detektywów")]
[assembly: AssemblyProduct("Agencja Cyfrowych Detektywów")]
[assembly: AssemblyVersion("1.0.0.0")]

static class Konfig
{
    // Zwiększ, gdy zmieniasz ten plik – uczniowie dostaną nowy .exe automatycznie.
    public const int WersjaAplikacji = 1;
    public const string Repo = "bobby6robert/agencja-informatyka";
    public const string Galaz = "main";
    public const string Tytul = "Agencja Cyfrowych Detektywów";

    public static readonly string Dane = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AgencjaCyfrowychDetektywow");

    public static string Raw(string sciezka)
    {
        var czesci = sciezka.Split('/');
        for (int i = 0; i < czesci.Length; i++) czesci[i] = Uri.EscapeDataString(czesci[i]);
        return "https://raw.githubusercontent.com/" + Repo + "/" + Galaz + "/" + string.Join("/", czesci);
    }

    public static string Lokalnie(string sciezka)
    {
        return Path.Combine(Dane, sciezka.Replace('/', Path.DirectorySeparatorChar));
    }
}

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        if (WebRequest.DefaultWebProxy != null) WebRequest.DefaultWebProxy.Credentials = CredentialCache.DefaultCredentials;
        try { File.Delete(Application.ExecutablePath + ".old"); } catch { }

        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new OknoGlowne(Array.IndexOf(args, "--po-aktualizacji") >= 0));
    }
}

static class Json
{
    static readonly JavaScriptSerializer Ser = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };

    public static Dictionary<string, object> Parsuj(string tekst)
    {
        return (Dictionary<string, object>)Ser.DeserializeObject(tekst.TrimStart('﻿'));
    }

    public static string Zapisz(object o) { return Ser.Serialize(o); }

    public static string Tekst(Dictionary<string, object> d, string klucz)
    {
        object v; return d != null && d.TryGetValue(klucz, out v) && v != null ? Convert.ToString(v) : "";
    }

    public static long Liczba(Dictionary<string, object> d, string klucz)
    {
        object v; return d != null && d.TryGetValue(klucz, out v) && v != null ? Convert.ToInt64(v) : 0;
    }

    public static bool Prawda(Dictionary<string, object> d, string klucz)
    {
        object v; return d != null && d.TryGetValue(klucz, out v) && v is bool && (bool)v;
    }

    public static List<Dictionary<string, object>> Lista(Dictionary<string, object> d, string klucz)
    {
        var wynik = new List<Dictionary<string, object>>();
        object v;
        if (d != null && d.TryGetValue(klucz, out v) && v is object[])
            foreach (var e in (object[])v)
                if (e is Dictionary<string, object>) wynik.Add((Dictionary<string, object>)e);
        return wynik;
    }
}

static class Siec
{
    static HttpWebRequest Zapytanie(string url)
    {
        var r = (HttpWebRequest)WebRequest.Create(url);
        r.UserAgent = "AgencjaCyfrowychDetektywow/" + Konfig.WersjaAplikacji;
        r.Timeout = 15000;
        r.ReadWriteTimeout = 60000;
        return r;
    }

    public static string PobierzTekst(string url)
    {
        using (var odp = Zapytanie(url).GetResponse())
        using (var s = new StreamReader(odp.GetResponseStream(), Encoding.UTF8))
            return s.ReadToEnd();
    }

    // postep(ileBajtowWTymKroku)
    public static void PobierzPlik(string url, string cel, Action<int> postep)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(cel));
        using (var odp = Zapytanie(url).GetResponse())
        using (var we = odp.GetResponseStream())
        using (var wy = File.Create(cel))
        {
            var bufor = new byte[65536];
            int n;
            while ((n = we.Read(bufor, 0, bufor.Length)) > 0)
            {
                wy.Write(bufor, 0, n);
                if (postep != null) postep(n);
            }
        }
    }

    public static string Sha256(string plik)
    {
        using (var sha = SHA256.Create())
        using (var s = File.OpenRead(plik))
            return BitConverter.ToString(sha.ComputeHash(s)).Replace("-", "").ToLowerInvariant();
    }
}

class OknoGlowne : Form
{
    static readonly Color Granat = Color.FromArgb(20, 33, 61);
    static readonly Color Zloty = Color.FromArgb(252, 163, 17);
    static readonly Color Tlo = Color.FromArgb(243, 245, 249);

    readonly bool poAktualizacjiAplikacji;
    readonly Label status = new Label();
    readonly ProgressBar pasek = new ProgressBar();
    readonly Panel panelStatusu = new Panel();
    readonly FlowLayoutPanel zakladki = new FlowLayoutPanel();
    readonly FlowLayoutPanel kafelki = new FlowLayoutPanel();
    readonly Label stopka = new Label();
    readonly Button odswiez = new Button();

    Dictionary<string, object> manifest;
    int wybranaKlasa;
    bool trwa;

    public OknoGlowne(bool poAktualizacji)
    {
        poAktualizacjiAplikacji = poAktualizacji;
        Text = Konfig.Tytul;
        try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }
        Font = new Font("Segoe UI", 10f);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = new Size(860, 560);
        MinimumSize = new Size(640, 460);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Tlo;

        var naglowek = new Panel { Dock = DockStyle.Top, Height = 92, BackColor = Granat };
        naglowek.Controls.Add(new Label
        {
            Text = "🔍  " + Konfig.Tytul, ForeColor = Color.White, Font = new Font("Segoe UI Semibold", 20f),
            AutoSize = true, Location = new Point(24, 14), BackColor = Color.Transparent
        });
        naglowek.Controls.Add(new Label
        {
            Text = "Informatyka – lekcje, misje i sprawdziany", ForeColor = Zloty, Font = new Font("Segoe UI", 11f),
            AutoSize = true, Location = new Point(28, 56), BackColor = Color.Transparent
        });

        zakladki.Dock = DockStyle.Top;
        zakladki.Height = 58;
        zakladki.Padding = new Padding(20, 12, 20, 0);
        zakladki.BackColor = Tlo;

        kafelki.Dock = DockStyle.Fill;
        kafelki.Padding = new Padding(20, 10, 20, 10);
        kafelki.AutoScroll = true;
        kafelki.BackColor = Tlo;

        panelStatusu.Dock = DockStyle.Bottom;
        panelStatusu.Height = 64;
        panelStatusu.Padding = new Padding(24, 8, 24, 10);
        panelStatusu.BackColor = Color.White;
        status.Dock = DockStyle.Top;
        status.Height = 24;
        status.Text = "Sprawdzam, czy są nowe materiały…";
        pasek.Dock = DockStyle.Bottom;
        pasek.Height = 18;
        panelStatusu.Controls.Add(status);
        panelStatusu.Controls.Add(pasek);

        var dol = new Panel { Dock = DockStyle.Bottom, Height = 40, BackColor = Tlo, Padding = new Padding(24, 6, 20, 6) };
        stopka.Dock = DockStyle.Fill;
        stopka.ForeColor = Color.Gray;
        stopka.TextAlign = ContentAlignment.MiddleLeft;
        odswiez.Text = "Sprawdź aktualizacje";
        odswiez.Dock = DockStyle.Right;
        odswiez.Width = 170;
        odswiez.FlatStyle = FlatStyle.System;
        odswiez.Click += delegate { Aktualizuj(); };
        dol.Controls.Add(stopka);
        dol.Controls.Add(odswiez);

        Controls.Add(kafelki);
        Controls.Add(zakladki);
        Controls.Add(naglowek);
        Controls.Add(panelStatusu);
        Controls.Add(dol);

        Shown += delegate { Aktualizuj(); };
    }

    void UI(MethodInvoker a)
    {
        if (IsDisposed) return;
        try { if (InvokeRequired) BeginInvoke(a); else a(); } catch (ObjectDisposedException) { } catch (InvalidOperationException) { }
    }

    void Status(string tekst, int procent)
    {
        UI(delegate
        {
            panelStatusu.Visible = true;
            status.Text = tekst;
            if (procent < 0) { pasek.Style = ProgressBarStyle.Marquee; }
            else { pasek.Style = ProgressBarStyle.Continuous; pasek.Value = Math.Max(0, Math.Min(100, procent)); }
        });
    }

    // ---------------- Aktualizacja ----------------

    void Aktualizuj()
    {
        if (trwa) return;
        trwa = true;
        odswiez.Enabled = false;
        Status("Sprawdzam, czy są nowe materiały…", -1);
        var w = new Thread(Watek) { IsBackground = true };
        w.Start();
    }

    void Watek()
    {
        string komunikat = null;
        bool ostrzezenie = false;
        try
        {
            string plikManifestu = Konfig.Lokalnie("manifest.json");
            Dictionary<string, object> lokalny = null;
            try { lokalny = Json.Parsuj(File.ReadAllText(plikManifestu, Encoding.UTF8)); } catch { }

            Dictionary<string, object> zdalny = null;
            string tekstZdalny = null;
            try
            {
                tekstZdalny = Siec.PobierzTekst(Konfig.Raw("manifest.json") + "?t=" + DateTime.UtcNow.Ticks);
                zdalny = Json.Parsuj(tekstZdalny);
            }
            catch { }

            if (zdalny == null)
            {
                if (lokalny == null)
                {
                    komunikat = "Nie udało się pobrać materiałów – brak połączenia z internetem (GitHub).\n" +
                                "Przy pierwszym uruchomieniu internet jest potrzebny.";
                    ostrzezenie = true;
                }
                else
                {
                    manifest = lokalny;
                    komunikat = "Brak internetu – działam na ostatnio pobranej wersji materiałów.";
                    ostrzezenie = true;
                }
                return;
            }

            if (!poAktualizacjiAplikacji && Json.Liczba(zdalny, "wersjaAplikacji") > Konfig.WersjaAplikacji
                && AktualizujAplikacje(zdalny)) return;

            int bledy = PobierzPliki(zdalny);
            Directory.CreateDirectory(Konfig.Dane);
            if (bledy == 0) File.WriteAllText(plikManifestu, tekstZdalny, new UTF8Encoding(false));
            manifest = zdalny;

            long stara = Json.Liczba(lokalny, "wersja"), nowa = Json.Liczba(zdalny, "wersja");
            if (bledy > 0)
            {
                komunikat = "Nie udało się pobrać " + bledy + " plików. Spróbuj „Sprawdź aktualizacje” za chwilę.";
                ostrzezenie = true;
            }
            else if (lokalny == null)
                komunikat = "Materiały pobrane (wersja " + nowa + ").";
            else if (nowa != stara)
            {
                string opis = Json.Tekst(zdalny, "opis");
                komunikat = "Zaktualizowano do wersji " + nowa + (opis != "" ? ": " + opis : ".");
            }
        }
        catch (Exception ex)
        {
            komunikat = "Błąd aktualizacji: " + ex.Message;
            ostrzezenie = true;
        }
        finally
        {
            UI(delegate { PoAktualizacji(komunikat, ostrzezenie); });
        }
    }

    int PobierzPliki(Dictionary<string, object> m)
    {
        string plikIndeksu = Konfig.Lokalnie("indeks.json");
        var indeks = new Dictionary<string, object>();
        try { indeks = Json.Parsuj(File.ReadAllText(plikIndeksu, Encoding.UTF8)); } catch { }

        var pliki = Json.Lista(m, "pliki");
        var doPobrania = new List<Dictionary<string, object>>();
        var oczekiwane = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        long razem = 0;
        foreach (var p in pliki)
        {
            string sciezka = Json.Tekst(p, "p");
            string lok = Konfig.Lokalnie(sciezka);
            oczekiwane.Add(Path.GetFullPath(lok));
            var fi = new FileInfo(lok);
            if (!fi.Exists || fi.Length != Json.Liczba(p, "r") || Json.Tekst(indeks, sciezka) != Json.Tekst(p, "h"))
            {
                doPobrania.Add(p);
                razem += Json.Liczba(p, "r");
            }
        }

        int bledy = 0;
        long pobrano = 0;
        for (int i = 0; i < doPobrania.Count; i++)
        {
            var p = doPobrania[i];
            string sciezka = Json.Tekst(p, "p"), hash = Json.Tekst(p, "h");
            string lok = Konfig.Lokalnie(sciezka), tmp = lok + ".pobieranie";
            string nazwa = Path.GetFileName(lok);
            long przed = pobrano;
            bool ok = false;
            for (int proba = 0; proba < 2 && !ok; proba++)
            {
                pobrano = przed;
                try
                {
                    Siec.PobierzPlik(Konfig.Raw(sciezka) + "?h=" + hash.Substring(0, Math.Min(12, hash.Length)), tmp, delegate (int n)
                    {
                        pobrano += n;
                        Status(string.Format("Pobieram nowe materiały ({0}/{1}): {2}  –  {3:0.0} / {4:0.0} MB",
                            i + 1, doPobrania.Count, nazwa, pobrano / 1048576.0, razem / 1048576.0),
                            razem > 0 ? (int)(pobrano * 100 / razem) : 0);
                    });
                    if (Siec.Sha256(tmp) != hash) throw new IOException("Niezgodna suma kontrolna");
                    if (File.Exists(lok)) File.Delete(lok);
                    File.Move(tmp, lok);
                    indeks[sciezka] = hash;
                    File.WriteAllText(plikIndeksu, Json.Zapisz(indeks), new UTF8Encoding(false));
                    ok = true;
                }
                catch { try { File.Delete(tmp); } catch { } }
            }
            if (!ok) bledy++;
        }

        // Usuń pliki, których nauczyciel już nie publikuje.
        string tresc = Konfig.Lokalnie("tresc");
        if (bledy == 0 && Directory.Exists(tresc))
        {
            foreach (var f in Directory.GetFiles(tresc, "*", SearchOption.AllDirectories))
                if (!oczekiwane.Contains(Path.GetFullPath(f))) try { File.Delete(f); } catch { }
            foreach (var d in Directory.GetDirectories(tresc, "*", SearchOption.AllDirectories))
                try { if (Directory.Exists(d) && Directory.GetFileSystemEntries(d).Length == 0) Directory.Delete(d); } catch { }
        }
        return bledy;
    }

    // Podmienia działający .exe na nowszy z GitHuba. Gdy folder jest tylko do odczytu – po prostu pomija.
    bool AktualizujAplikacje(Dictionary<string, object> m)
    {
        string exe = Application.ExecutablePath, nowy = exe + ".new", stary = exe + ".old";
        try
        {
            Status("Pobieram nową wersję aplikacji…", -1);
            Siec.PobierzPlik(Konfig.Raw(Json.Tekst(m, "plikAplikacji")) + "?t=" + DateTime.UtcNow.Ticks, nowy, null);
            if (Siec.Sha256(nowy) != Json.Tekst(m, "hashAplikacji")) throw new IOException("Niezgodna suma kontrolna");
            if (File.Exists(stary)) File.Delete(stary);
            File.Move(exe, stary);
            File.Move(nowy, exe);
            Process.Start(new ProcessStartInfo(exe, "--po-aktualizacji") { UseShellExecute = false });
            UI(delegate { Close(); });
            return true;
        }
        catch
        {
            try { if (!File.Exists(exe) && File.Exists(stary)) File.Move(stary, exe); } catch { }
            try { File.Delete(nowy); } catch { }
            return false;
        }
    }

    void PoAktualizacji(string komunikat, bool ostrzezenie)
    {
        trwa = false;
        odswiez.Enabled = true;
        panelStatusu.Visible = false;
        stopka.Text = manifest != null
            ? "Wersja materiałów: " + Json.Liczba(manifest, "wersja") + "   •   aplikacja v" + Konfig.WersjaAplikacji
            : "Brak materiałów";
        ZbudujMenu();
        if (komunikat != null)
            MessageBox.Show(this, komunikat, Konfig.Tytul, MessageBoxButtons.OK,
                ostrzezenie ? MessageBoxIcon.Warning : MessageBoxIcon.Information);
    }

    // ---------------- Menu ----------------

    void ZbudujMenu()
    {
        zakladki.Controls.Clear();
        kafelki.Controls.Clear();
        if (manifest == null) return;
        var menu = manifest.ContainsKey("menu") ? manifest["menu"] as Dictionary<string, object> : null;
        var klasy = Json.Lista(menu, "klasy");
        if (wybranaKlasa >= klasy.Count || !Json.Prawda(klasy[wybranaKlasa], "aktywna"))
            wybranaKlasa = Math.Max(0, klasy.FindIndex(k => Json.Prawda(k, "aktywna")));

        for (int i = 0; i < klasy.Count; i++)
        {
            int nr = i;
            bool aktywna = Json.Prawda(klasy[i], "aktywna");
            var b = new Button
            {
                Text = Json.Tekst(klasy[i], "nazwa") + (aktywna ? "" : " (wkrótce)"),
                AutoSize = true, MinimumSize = new Size(120, 38), Enabled = aktywna,
                FlatStyle = FlatStyle.Flat, Font = new Font("Segoe UI Semibold", 11f), Margin = new Padding(0, 0, 8, 0),
                BackColor = nr == wybranaKlasa ? Granat : Color.White,
                ForeColor = nr == wybranaKlasa ? Color.White : (aktywna ? Granat : Color.Silver),
                Cursor = Cursors.Hand
            };
            b.FlatAppearance.BorderColor = Granat;
            b.Click += delegate { wybranaKlasa = nr; ZbudujMenu(); };
            zakladki.Controls.Add(b);
        }

        if (klasy.Count == 0) return;
        var klasa = klasy[wybranaKlasa];
        string podtytul = Json.Tekst(klasa, "podtytul");
        if (podtytul != "")
            kafelki.Controls.Add(new Label
            {
                Text = podtytul, AutoSize = true, ForeColor = Color.DimGray, Font = new Font("Segoe UI", 11f),
                Margin = new Padding(4, 0, 0, 8)
            });
        if (kafelki.Controls.Count > 0) kafelki.SetFlowBreak(kafelki.Controls[0], true);
        foreach (var poz in Json.Lista(klasa, "pozycje")) kafelki.Controls.Add(Kafelek(poz));
    }

    Control Kafelek(Dictionary<string, object> poz)
    {
        string typ = Json.Tekst(poz, "typ");
        string ikona = Json.Tekst(poz, "ikona");
        if (ikona == "") ikona = typ == "folder" ? "📁" : "📘";
        var k = new Panel
        {
            Size = new Size(250, 150), Margin = new Padding(4, 4, 14, 14), BackColor = Color.White, Cursor = Cursors.Hand
        };
        var pasekKoloru = new Panel { Dock = DockStyle.Left, Width = 6, BackColor = Zloty };
        var tytul = new Label
        {
            Text = ikona + "  " + Json.Tekst(poz, "nazwa"), Font = new Font("Segoe UI Semibold", 13f), ForeColor = Granat,
            Location = new Point(18, 14), Size = new Size(225, 56)
        };
        var opis = new Label
        {
            Text = Json.Tekst(poz, "opis"), ForeColor = Color.DimGray, Location = new Point(18, 72), Size = new Size(225, 70)
        };
        k.Controls.Add(pasekKoloru);
        k.Controls.Add(tytul);
        k.Controls.Add(opis);
        EventHandler klik = delegate { Otworz(poz); };
        k.Click += klik; tytul.Click += klik; opis.Click += klik;
        EventHandler nad = delegate { k.BackColor = Color.FromArgb(255, 248, 230); };
        EventHandler poza = delegate { k.BackColor = Color.White; };
        foreach (Control c in new Control[] { k, tytul, opis }) { c.MouseEnter += nad; c.MouseLeave += poza; }
        return k;
    }

    void Otworz(Dictionary<string, object> poz)
    {
        try
        {
            if (Json.Tekst(poz, "typ") == "folder") KopiujNaPulpit(poz);
            else OtworzStrone(Konfig.Lokalnie(Json.Tekst(poz, "plik")));
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, "Nie udało się otworzyć: " + ex.Message, Konfig.Tytul, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    static string ZnajdzEdge()
    {
        foreach (var baza in new[] {
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) })
        {
            if (string.IsNullOrEmpty(baza)) continue;
            string p = Path.Combine(baza, @"Microsoft\Edge\Application\msedge.exe");
            if (File.Exists(p)) return p;
        }
        return null;
    }

    void OtworzStrone(string plik)
    {
        if (!File.Exists(plik)) throw new FileNotFoundException("Brak pliku – kliknij „Sprawdź aktualizacje”.");
        string url = new Uri(plik).AbsoluteUri;
        string edge = ZnajdzEdge();
        if (edge != null)
            Process.Start(edge, "--app=\"" + url + "\" --start-maximized");
        else
            Process.Start(plik); // domyślna przeglądarka
    }

    void KopiujNaPulpit(Dictionary<string, object> poz)
    {
        string zrodlo = Konfig.Lokalnie(Json.Tekst(poz, "folder"));
        if (!Directory.Exists(zrodlo)) throw new DirectoryNotFoundException("Brak plików – kliknij „Sprawdź aktualizacje”.");
        string nazwa = Json.Tekst(poz, "cel");
        if (nazwa == "") nazwa = Path.GetFileName(zrodlo);
        string cel = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), nazwa);

        if (Directory.Exists(cel))
        {
            var odp = MessageBox.Show(this,
                "Folder „" + nazwa + "” jest już na Pulpicie.\n\n" +
                "Tak – zastąp go świeżą kopią (Twoje zmiany w tym folderze przepadną).\n" +
                "Nie – tylko otwórz istniejący folder.",
                Konfig.Tytul, MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
            if (odp == DialogResult.Cancel) return;
            if (odp == DialogResult.Yes)
            {
                Directory.Delete(cel, true);
                KopiujFolder(zrodlo, cel);
            }
        }
        else KopiujFolder(zrodlo, cel);
        Process.Start("explorer.exe", "\"" + cel + "\"");
    }

    static void KopiujFolder(string z, string d)
    {
        Directory.CreateDirectory(d);
        foreach (var f in Directory.GetFiles(z)) File.Copy(f, Path.Combine(d, Path.GetFileName(f)), true);
        foreach (var k in Directory.GetDirectories(z)) KopiujFolder(k, Path.Combine(d, Path.GetFileName(k)));
    }
}
