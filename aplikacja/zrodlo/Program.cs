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
using System.Management;
using System.Reflection;
using System.Runtime.InteropServices;
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
    public const int WersjaAplikacji = 3;
    public const string Repo = "bobby6robert/agencja-informatyka";
    public const string Galaz = "main";
    public const string Tytul = "Agencja Cyfrowych Detektywów";
    // Ten sam adres skryptu co w gra.js, panelu i prowadzeniu. Do testów: --api=http://127.0.0.1:PORT/ --pc=NAZWA
    public static string Api = "https://script.google.com/macros/s/AKfycbzGvnKlock74eu0ptTr8Dy7O7BKdnQBL2V8B9vFoSWcl80k3ZLd06R1tBz8m82dQPKySw/exec";
    public static string Komputer = Environment.MachineName;
    public static bool Test;

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
        foreach (var a in args)
        {
            if (a.StartsWith("--api=http://127.0.0.1:")) { Konfig.Api = a.Substring(6); Konfig.Test = true; }
            if (a.StartsWith("--pc=")) Konfig.Komputer = a.Substring(5);
        }

        LokalnaKonsola.Start();
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

    // Zapytanie do skryptu w arkuszu (ten sam format co w grze: JSON jako text/plain).
    public static Dictionary<string, object> Api(Dictionary<string, object> dane)
    {
        var r = Zapytanie(Konfig.Api);
        r.Method = "POST";
        r.ContentType = "text/plain;charset=utf-8";
        byte[] b = Encoding.UTF8.GetBytes(Json.Zapisz(dane));
        using (var s = r.GetRequestStream()) s.Write(b, 0, b.Length);
        using (var odp = r.GetResponse())
        using (var s = new StreamReader(odp.GetResponseStream(), Encoding.UTF8))
            return Json.Parsuj(s.ReadToEnd());
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
    Pracownia pracownia;
    string stopkaBaza = "", stopkaPracownia = "";

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
        FormClosing += delegate { if (pracownia != null) pracownia.Zakoncz(); };
    }

    void UstawStopke()
    {
        stopka.Text = stopkaBaza + "   •   komputer: " + Konfig.Komputer + (stopkaPracownia != "" ? "   •   " + stopkaPracownia : "");
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
        stopkaBaza = manifest != null
            ? "Wersja materiałów: " + Json.Liczba(manifest, "wersja") + "   •   aplikacja v" + Konfig.WersjaAplikacji
            : "Brak materiałów";
        UstawStopke();
        ZbudujMenu();
        if (manifest != null && pracownia == null)
        {
            pracownia = new Pracownia(this, ZnajdzEdge());
            pracownia.Info = delegate (string t) { stopkaPracownia = t; UstawStopke(); };
            pracownia.Start();
        }
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

    internal static string ZnajdzEdge()
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
        if (LokalnaKonsola.Port > 0) url += "?" + LokalnaKonsola.Parametry();
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

// ---------------- Pracownia: pełny ekran z grą i blokada klawiszy w czasie lekcji ----------------
// Działa tylko na komputerach, których nazwy nauczyciel wpisał w arkuszu (Ustawienia!B2).
// Skrypt mówi, czy trwa lekcja i czy blokada jest włączona; blokada znika po dzwonku,
// po odblokowaniu w panelu albo po haśle nauczyciela (Ctrl+Shift+Q na komputerze ucznia).
// Ctrl+Alt+Del nie da się zablokować – gra zgłasza wtedy wyjście z okna w Prowadzeniu lekcji.
class Pracownia
{
    readonly Form okno;
    readonly string edge;
    readonly System.Windows.Forms.Timer zegar = new System.Windows.Forms.Timer { Interval = 30000 };
    readonly System.Windows.Forms.Timer straznik = new System.Windows.Forms.Timer { Interval = 1000 };
    readonly string profil = Konfig.Lokalnie("edge-pracownia");
    readonly long start = Teraz();
    public Action<string> Info = delegate { };

    bool pyta, zablokowana, okienkoHasla;
    string lekcja = "", odblokowanaLekcja = "";   // klucz lekcji: klasa|grupa|koniec
    int rocznik;
    long koniec;
    Process kiosk;

    static Pracownia aktywna;
    static IntPtr hak = IntPtr.Zero;
    static readonly Natywne.HookProc procHaka = Hak;

    public Pracownia(Form okno, string edge)
    {
        this.okno = okno;
        this.edge = edge;
        zegar.Tick += delegate { Sprawdz(); };
        straznik.Tick += delegate { Pilnuj(); };
    }

    static long Teraz() { return (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds; }

    public void Start() { zegar.Start(); Sprawdz(); }

    public void Zakoncz() { zegar.Stop(); Odblokuj(); }

    void Sprawdz()
    {
        if (pyta) return;
        pyta = true;
        new Thread(delegate ()
        {
            Dictionary<string, object> r = null;
            try { r = Siec.Api(new Dictionary<string, object> { { "a", "teraz" }, { "pc", Konfig.Komputer } }); } catch { }
            try { okno.BeginInvoke((MethodInvoker)delegate { pyta = false; Decyzja(r); }); } catch { }
        }) { IsBackground = true }.Start();
    }

    void Decyzja(Dictionary<string, object> r)
    {
        if (r == null) { if (zablokowana && Teraz() > koniec) Odblokuj(); return; }   // bez internetu: trzymaj stan do dzwonka
        if (!Json.Prawda(r, "pracownia")) { Odblokuj(); Info(""); return; }
        string k = Json.Tekst(r, "k");
        if (k == "") { Odblokuj(); Info("pracownia: brak lekcji"); return; }
        koniec = Json.Liczba(r, "koniec");
        if (Konfig.Test) koniec = Math.Min(koniec, start + 180000);   // test: najwyżej 3 minuty blokady
        lekcja = k + "|" + Json.Tekst(r, "g") + "|" + Json.Liczba(r, "koniec");
        if (!Json.Prawda(r, "blok") || lekcja == odblokowanaLekcja || Teraz() > koniec)
        {
            Odblokuj(); Info("pracownia: " + k + " – odblokowane"); return;
        }
        int.TryParse(k.Substring(0, 1), out rocznik);
        Zablokuj();
        if (zablokowana) Info("pracownia: " + k + " – blokada do końca lekcji");
    }

    string StronaGry()
    {
        string plik = Konfig.Lokalnie("tresc/klasa" + rocznik + "/gra/index.html");
        return File.Exists(plik) ? new Uri(plik).AbsoluteUri + "?tryb=pracownia" + (LokalnaKonsola.Port > 0 ? "&" + LokalnaKonsola.Parametry() : "") : null;
    }

    void Zablokuj()
    {
        if (edge == null || StronaGry() == null) { Info("pracownia: brak Edge lub gry – blokada niemożliwa"); return; }
        if (zablokowana) return;
        // nowa lekcja = czysty profil (na wspólnym komputerze nie zostaje konto poprzedniego ucznia)
        string plikLekcji = Konfig.Lokalnie("pracownia-lekcja.txt");
        string poprzednia = "";
        try { poprzednia = File.ReadAllText(plikLekcji); } catch { }
        if (poprzednia != lekcja)
        {
            ZamknijKiosk();
            try { if (Directory.Exists(profil)) Directory.Delete(profil, true); } catch { }
            try { File.WriteAllText(plikLekcji, lekcja); } catch { }
        }
        zablokowana = true;
        aktywna = this;
        if (hak == IntPtr.Zero)
            hak = Natywne.SetWindowsHookEx(13, procHaka, Natywne.GetModuleHandle(null), 0);   // WH_KEYBOARD_LL
        straznik.Start();
        Pilnuj();
    }

    void Odblokuj()
    {
        if (!zablokowana) return;
        zablokowana = false;
        straznik.Stop();
        if (hak != IntPtr.Zero) { Natywne.UnhookWindowsHookEx(hak); hak = IntPtr.Zero; }
        aktywna = null;
    }

    // Edge uruchomione z naszym profilem (także z poprzedniego uruchomienia aplikacji).
    List<Process> EdgeZProfilem()
    {
        var lista = new List<Process>();
        try
        {
            using (var s = new ManagementObjectSearcher("SELECT ProcessId, CommandLine FROM Win32_Process WHERE Name = 'msedge.exe'"))
                foreach (ManagementObject o in s.Get())
                {
                    string cmd = Convert.ToString(o["CommandLine"]);
                    if (cmd.IndexOf(profil, StringComparison.OrdinalIgnoreCase) < 0) continue;
                    try { lista.Add(Process.GetProcessById(Convert.ToInt32(o["ProcessId"]))); } catch { }
                }
        }
        catch { }
        return lista;
    }

    void ZamknijKiosk()
    {
        foreach (var p in EdgeZProfilem()) try { p.Kill(); } catch { }
        kiosk = null;
    }

    void UruchomKiosk()
    {
        ZamknijKiosk();
        kiosk = Process.Start(new ProcessStartInfo(edge,
            "--kiosk \"" + StronaGry() + "\" --edge-kiosk-type=fullscreen --no-first-run --no-default-browser-check " +
            "--user-data-dir=\"" + profil + "\"") { UseShellExecute = false });
    }

    void Pilnuj()
    {
        if (!zablokowana) return;
        if (Teraz() > koniec) { Odblokuj(); Info("pracownia: koniec lekcji – odblokowane"); return; }
        if (kiosk == null || kiosk.HasExited) { UruchomKiosk(); return; }
        if (okienkoHasla) return;
        IntPtr fg = Natywne.GetForegroundWindow();
        uint pid;
        Natywne.GetWindowThreadProcessId(fg, out pid);
        if (pid == kiosk.Id || pid == Process.GetCurrentProcess().Id) return;
        if (LokalnaKonsola.CzyVeyon(pid)) return;   // demonstracja / blokada ekranu Veyon ma pierwszeństwo
        kiosk.Refresh();
        IntPtr h = kiosk.MainWindowHandle;
        if (h == IntPtr.Zero) return;
        Natywne.keybd_event(0x12, 0, 0, UIntPtr.Zero);   // Alt (wstrzyknięty) pozwala przejąć pierwszy plan
        Natywne.keybd_event(0x12, 0, 2, UIntPtr.Zero);
        Natywne.ShowWindow(h, 9);
        Natywne.SetForegroundWindow(h);
    }

    // ---------- blokada klawiszy ----------
    static bool Wcisniety(int vk) { return (Natywne.GetAsyncKeyState(vk) & 0x8000) != 0; }

    static bool Zakazany(int vk, bool alt, bool ctrl, bool shift)
    {
        if (vk == 0x5B || vk == 0x5C) return true;                                   // Windows
        if (vk == 0x7A || vk == 0x7B) return true;                                   // F11, F12
        if (alt && (vk == 0x09 || vk == 0x1B || vk == 0x73 || vk == 0x20 || vk == 0x24)) return true;   // Alt+Tab/Esc/F4/Spacja/Home
        if (ctrl && (vk == 0x1B || vk == 0x73)) return true;                         // Ctrl+Esc, Ctrl+Shift+Esc, Ctrl+F4
        if (ctrl && vk >= 0x41 && vk <= 0x5A && "NTWLOPHJKEUSDGBMI".IndexOf((char)vk) >= 0) return true;   // nowe okna, adres, zapis, druk, narzędzia
        if (ctrl && shift && vk == 0x2E) return true;                                // Ctrl+Shift+Del
        return false;
    }

    static IntPtr Hak(int nCode, IntPtr wParam, IntPtr lParam)
    {
        var p = aktywna;
        if (nCode >= 0 && p != null && p.zablokowana)
        {
            var k = (Natywne.KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(Natywne.KBDLLHOOKSTRUCT));
            if ((k.flags & 0x10) == 0)   // klawisze wstrzyknięte przez program przepuszczamy
            {
                bool alt = (k.flags & 0x20) != 0, ctrl = Wcisniety(0x11), shift = Wcisniety(0x10);
                bool wcis = wParam == (IntPtr)0x100 || wParam == (IntPtr)0x104;
                int vk = (int)k.vkCode;
                if (ctrl && shift && vk == 0x51)   // Ctrl+Shift+Q – hasło nauczyciela
                {
                    if (wcis) try { p.okno.BeginInvoke((MethodInvoker)p.PokazHaslo); } catch { }
                    return (IntPtr)1;
                }
                if (Zakazany(vk, alt, ctrl, shift)) return (IntPtr)1;
            }
        }
        return Natywne.CallNextHookEx(hak, nCode, wParam, lParam);
    }

    // ---------- hasło nauczyciela ----------
    void PokazHaslo()
    {
        if (okienkoHasla || !zablokowana) return;
        okienkoHasla = true;
        var f = new Form
        {
            Text = Konfig.Tytul, FormBorderStyle = FormBorderStyle.FixedDialog, StartPosition = FormStartPosition.CenterScreen,
            TopMost = true, ShowInTaskbar = false, MinimizeBox = false, MaximizeBox = false,
            ClientSize = new Size(380, 150), Font = new Font("Segoe UI", 10f)
        };
        var opis = new Label { Text = "Odblokowanie komputera do końca lekcji.\nHasło nauczyciela (to samo co do panelu):", Location = new Point(16, 12), Size = new Size(350, 40) };
        var pole = new TextBox { UseSystemPasswordChar = true, Location = new Point(16, 56), Width = 348 };
        var stan = new Label { Location = new Point(16, 86), Size = new Size(185, 40), ForeColor = Color.Firebrick };
        var ok = new Button { Text = "Odblokuj", Location = new Point(204, 108), Width = 80 };
        var anuluj = new Button { Text = "Anuluj", Location = new Point(288, 108), Width = 76, DialogResult = DialogResult.Cancel };
        f.Controls.AddRange(new Control[] { opis, pole, stan, ok, anuluj });
        f.AcceptButton = ok; f.CancelButton = anuluj;
        ok.Click += delegate
        {
            ok.Enabled = false; stan.Text = "Sprawdzam…";
            string haslo = pole.Text;
            new Thread(delegate ()
            {
                string e = null;
                try
                {
                    var r = Siec.Api(new Dictionary<string, object> { { "a", "nauczyciel" }, { "haslo", haslo } });
                    if (!Json.Prawda(r, "ok")) e = Json.Tekst(r, "e") == "blokada" ? "Za dużo prób – odczekaj 10 minut." : "Złe hasło.";
                }
                catch { e = "Brak połączenia z arkuszem."; }
                try
                {
                    f.BeginInvoke((MethodInvoker)delegate
                    {
                        if (e != null) { stan.Text = e; ok.Enabled = true; pole.SelectAll(); pole.Focus(); return; }
                        odblokowanaLekcja = lekcja;
                        Odblokuj();
                        Info("pracownia: odblokowane hasłem do końca lekcji");
                        f.Close();
                    });
                }
                catch { }
            }) { IsBackground = true }.Start();
        };
        f.FormClosed += delegate { okienkoHasla = false; };
        f.Shown += delegate { f.Activate(); pole.Focus(); };
        f.Show();
    }
}

static class Natywne
{
    public delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    public struct KBDLLHOOKSTRUCT { public uint vkCode, scanCode, flags, time; public UIntPtr dwExtraInfo; }

    [DllImport("user32.dll", SetLastError = true)] public static extern IntPtr SetWindowsHookEx(int idHook, HookProc fn, IntPtr hMod, uint threadId);
    [DllImport("user32.dll")] public static extern bool UnhookWindowsHookEx(IntPtr hhk);
    [DllImport("user32.dll")] public static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr GetModuleHandle(string name);
    [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int vk);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
    [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
}

// Konsola w grze z prawdziwymi danymi: gra (strona z plików lokalnych) wysyła do aplikacji na 127.0.0.1 polecenie
// z białej listy (ipconfig, getmac, ping, tracert, nslookup…), aplikacja uruchamia je naprawdę i odsyła wynik.
// /info zwraca dane komputera do zadań (nazwa, system, procesor, RAM, karty sieciowe).
// Bez żetonu z adresu strony (?konsola=port&kt=żeton) serwer niczego nie wykonuje.
static class LokalnaKonsola
{
    public static int Port;
    static readonly string Zeton = Guid.NewGuid().ToString("N").Substring(0, 16);
    static System.Net.Sockets.TcpListener sluchacz;
    static readonly System.Text.RegularExpressions.Regex Host =
        new System.Text.RegularExpressions.Regex(@"^[A-Za-z0-9][A-Za-z0-9.\-]{0,252}$");

    public static void Start()
    {
        for (int p = 47811; p < 47821 && sluchacz == null; p++)
        {
            try { var s = new System.Net.Sockets.TcpListener(IPAddress.Loopback, p); s.Start(); sluchacz = s; Port = p; }
            catch { }
        }
        if (sluchacz != null) new Thread(Petla) { IsBackground = true }.Start();
    }

    // dopisywane do adresu strony otwieranej z aplikacji
    public static string Parametry() { return Port > 0 ? "konsola=" + Port + "&kt=" + Zeton : ""; }

    static void Petla()
    {
        while (true)
        {
            System.Net.Sockets.TcpClient k;
            try { k = sluchacz.AcceptTcpClient(); } catch { return; }
            ThreadPool.QueueUserWorkItem(delegate { Obsluz(k); });
        }
    }

    static void Obsluz(System.Net.Sockets.TcpClient klient)
    {
        try
        {
            using (klient)
            using (var s = klient.GetStream())
            {
                s.ReadTimeout = 5000;
                var r = new StreamReader(s, Encoding.ASCII);
                string pierwsza = r.ReadLine() ?? "";
                string linia;
                while (!string.IsNullOrEmpty(linia = r.ReadLine())) { }   // nagłówki pomijamy
                var cz = pierwsza.Split(' ');
                string odp;
                if (cz.Length < 2 || cz[0] != "GET") odp = Zapisz(false, "zapytanie", null);
                else
                {
                    var u = new Uri("http://localhost" + cz[1]);
                    var q = System.Web.HttpUtility.ParseQueryString(u.Query);
                    if (q["kt"] != Zeton) odp = Zapisz(false, "zeton", null);
                    else if (u.AbsolutePath == "/info") odp = Info();
                    else if (u.AbsolutePath == "/okno") odp = Json.Zapisz(new Dictionary<string, object> { { "ok", true }, { "veyon", OknoVeyon() } });
                    else odp = Wykonaj(q["c"] ?? "");
                }
                byte[] b = Encoding.UTF8.GetBytes(odp);
                byte[] n = Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: application/json; charset=utf-8\r\n" +
                    "Access-Control-Allow-Origin: *\r\nCache-Control: no-store\r\nContent-Length: " + b.Length + "\r\nConnection: close\r\n\r\n");
                s.Write(n, 0, n.Length); s.Write(b, 0, b.Length);
            }
        }
        catch { }
    }

    static string Zapisz(bool ok, string e, string wynik)
    {
        var d = new Dictionary<string, object> { { "ok", ok } };
        if (e != null) d["e"] = e;
        if (wynik != null) d["wynik"] = wynik;
        return Json.Zapisz(d);
    }

    // Czy na pierwszym planie jest okno Veyon (demonstracja nauczyciela, blokada ekranu) – wtedy to nie uczeń wyszedł z gry.
    public static bool CzyVeyon(uint pid)
    {
        try { return Process.GetProcessById((int)pid).ProcessName.StartsWith("veyon", StringComparison.OrdinalIgnoreCase); }
        catch { return false; }
    }
    static bool OknoVeyon()
    {
        uint pid; Natywne.GetWindowThreadProcessId(Natywne.GetForegroundWindow(), out pid);
        return CzyVeyon(pid);
    }

    static bool Liczba(string t, int od, int doo) { int x; return int.TryParse(t, out x) && x >= od && x <= doo; }

    // Biała lista: tylko te polecenia i tylko te argumenty. Zwraca argumenty do uruchomienia albo null.
    static string Argumenty(string p, List<string> a)
    {
        Func<string, bool> host = delegate (string h) { return Host.IsMatch(h); };
        switch (p)
        {
            case "ipconfig": return a.Count == 0 ? "" : a.Count == 1 && a[0].ToLowerInvariant() == "/all" ? "/all" : null;
            case "getmac": return a.Count == 0 ? "" : a.Count == 1 && a[0].ToLowerInvariant() == "/v" ? "/v" : null;
            case "hostname": case "systeminfo": return a.Count == 0 ? "" : null;
            case "arp": return a.Count == 1 && a[0].ToLowerInvariant() == "-a" ? "-a" : null;
            case "nslookup": return a.Count == 1 && host(a[0]) ? a[0] : null;
            case "ping":
                if (a.Count == 1 && host(a[0])) return "-n 4 " + a[0];
                if (a.Count == 3 && a[0].ToLowerInvariant() == "-n" && Liczba(a[1], 1, 6) && host(a[2])) return "-n " + a[1] + " " + a[2];
                return null;
            case "tracert":
                bool d = a.Count > 0 && a[0].ToLowerInvariant() == "-d";
                var r = d ? a.GetRange(1, a.Count - 1) : a;
                string hh = "15";
                if (r.Count == 3 && r[0].ToLowerInvariant() == "-h" && Liczba(r[1], 1, 20)) { hh = r[1]; r = r.GetRange(2, 1); }
                return r.Count == 1 && host(r[0]) ? (d ? "-d " : "") + "-h " + hh + " -w 800 " + r[0] : null;
        }
        return null;
    }

    static string Wykonaj(string linia)
    {
        var cz = new List<string>(linia.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));
        if (cz.Count == 0) return Zapisz(false, "puste", null);
        string p = cz[0].ToLowerInvariant();
        if (p.EndsWith(".exe")) p = p.Substring(0, p.Length - 4);
        string arg = Argumenty(p, cz.GetRange(1, cz.Count - 1));
        if (arg == null) return Zapisz(false, "niedozwolone", null);
        var oem = Encoding.GetEncoding(System.Globalization.CultureInfo.CurrentCulture.TextInfo.OEMCodePage);
        var psi = new ProcessStartInfo(p + ".exe", arg)
        {
            UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true,
            StandardOutputEncoding = oem, StandardErrorEncoding = oem
        };
        using (var pr = Process.Start(psi))
        {
            var bledy = pr.StandardError.ReadToEndAsync();
            var wynik = pr.StandardOutput.ReadToEndAsync();
            if (!pr.WaitForExit(p == "tracert" ? 90000 : 30000)) { try { pr.Kill(); } catch { } return Zapisz(false, "czas", null); }
            return Zapisz(true, null, (wynik.Result + bledy.Result).Replace("\r\n", "\n"));
        }
    }

    static string Info()
    {
        var d = new Dictionary<string, object>();
        d["ok"] = true;
        d["nazwa"] = Environment.MachineName;
        try
        {
            foreach (ManagementObject o in new ManagementObjectSearcher("SELECT Caption, Version, TotalVisibleMemorySize FROM Win32_OperatingSystem").Get())
            {
                d["system"] = Convert.ToString(o["Caption"]).Trim(); d["wersja"] = Convert.ToString(o["Version"]);
                d["ramGB"] = Math.Round(Convert.ToDouble(o["TotalVisibleMemorySize"]) / 1048576.0, 1);
            }
            foreach (ManagementObject o in new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem").Get())
                d["ramFizGB"] = Math.Round(Convert.ToDouble(o["TotalPhysicalMemory"]) / 1073741824.0, 1);
            foreach (ManagementObject o in new ManagementObjectSearcher("SELECT Name FROM Win32_Processor").Get())
                d["procesor"] = Convert.ToString(o["Name"]).Trim();
        }
        catch { }
        var karty = new List<object>();
        foreach (var ni in System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces())
        {
            if (ni.NetworkInterfaceType == System.Net.NetworkInformation.NetworkInterfaceType.Loopback) continue;
            var ip = ni.GetIPProperties();
            var v4 = new List<string>(); var bramy = new List<string>(); var dns = new List<string>();
            foreach (var a in ip.UnicastAddresses) if (a.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork) v4.Add(a.Address.ToString());
            foreach (var g in ip.GatewayAddresses) if (g.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork) bramy.Add(g.Address.ToString());
            foreach (var s in ip.DnsAddresses) if (s.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork) dns.Add(s.ToString());
            string mac = string.Join("-", Array.ConvertAll(ni.GetPhysicalAddress().GetAddressBytes(), x => x.ToString("X2")));
            karty.Add(new Dictionary<string, object> {
                { "nazwa", ni.Name }, { "opis", ni.Description }, { "dziala", ni.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up },
                { "mac", mac }, { "ip", v4 }, { "brama", bramy }, { "dns", dns } });
        }
        d["karty"] = karty;
        return Json.Zapisz(d);
    }
}
