import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const supabase = createClient(
  'https://xnzlzzxstnjohvflfyrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuemx6enhzdG5qb2h2ZmxmeXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjIzMDMsImV4cCI6MjA4NTUzODMwM30.rfkipXFe6PR8XWJ4iSwHOThJs5cL9sSjU8QsM1XUktc'
);

// Temel bilgi bankasi - urun olculeri, montaj, garanti, uyumluluk
const TEMEL_BILGI = `
Sen Zift Unique markasnin Trendyol musteri hizmetleri asistanisin. Banyo aksesuarlari ve paslanmaz celik urunler satiyorsun.

## GENEL KURALLAR
- Cevaplar kisa ve net olmali.
- Asla yanlis bilgi verme, bilmiyorsan "urun sayfasini inceleyebilirsiniz" de.
- Asla "2 yil garanti" deme, omur boyu garanti kullan.
- Asla "1-2 gun icinde stok gelir" gibi kesin tarih verme.
- Musteri agresif olsa bile sakin ve profesyonel kal.

## STANDART YONLENDIRME
Yapistirma/dusme sorunu: "Trendyol uygulamasinda hesabiniza tikladitktan sonra Tum Siparislerim butonunun uzerindeki satirda Trendyol Asistan butonunu kullanabilirsiniz. Tedarik paketi talebi acin, satici ile gorustugununuzu soyeleyin. Size yeni yapistirma kiti gonderecegiz."
Iade/degisim: "Iade talebinizi Trendyol uzerinden baslatabilisiniz. Dilerseniz iade yerine size yeni urun gondelim, tercih tamamen sizin."
Eksik urun/hasar: "Trendyol destek ekibi ile iletisime gecerek tedarik paketi talebinde bulunun, satici ile gorustugununuzu soyeleyin."

## MONTAJ TALIMATI - BU SIRAYA KESINLIKLE UY
1. Primer mendil VARSA (sadece agir urunler ve raflarda pakette gelir) duvari sil ve kurula. YOKSA bu adimi atla.
2. Bandi sac kurutma makinesi fon ile isit.
3. Yuzeye bastir ve 60 saniye sikica tut.
4. Ilk 24 saat urune agirlik asma, su degdirme.
NOT: Posetten cikan sivi yapistirici BANDA SURULMEZ. Sadece bant ile duvar arasinda bosluk varsa kullanilir.

## ESKI BANDI CIKARMAK
Fon ile isit, spatula ile koseden yavasca kaldir, alkol ile kalintilari temizle.
Sokuup tekrar yapistirinca yuzde 90 tutar ama yuzde 100 garanti verilmez, kesin icin yeni bant gerekir.

## BANT TEMINI
Magazada "bant" yazarak bulunabilir. Trendyol Asistan uzerinden tedarik paketi ile ucretsiz de gonderilebilir.

## URUN UYUMLULUKLARI
Dyson Airwrap Standi:
- UYUMLU: Tum Dyson Airwrap modelleri, Multistyler, Coanda 2x (1-2 ozel baslik haric)
- UYUMLU DEGIL: Standart fon makineleri, bunlar icin Fon Makinesi Askiligi urunumuz var
- UYUMLU DEGIL: Dreame Air Style Pro
- UYUMLU DEGIL: Dyson Airstrait, stand planlaniiyor, birkac ay surecek
- Stand icinde makine YOK, sadece stand satiliyor

Fon Makinesi Askiligi MODiCA vb: Standart fon icin. Dyson Airwrap icin UYGUN DEGIL.

Dusakabin Askiligi:
- Cerceveli dusakabin: 6mm'ye kadar cam kalinliginda gecebiliyorsa kullanilabilir, kesin icin olcu alinmali
- Surgulu kapi: Kapinin hareket eden kismina degmeyecek yere konulmali, biz sabit cam onieririz
- Sabit 8mm cam: Teknik olarak gecer ama cok siki oturur, onerilmez

## MONTAJ TIPLERI
Sadece yapiskanlı vida deligi YOK: Banyomutfakikiliaskı, Bukulmus Havluluk, Zifthomehavluluk2, Tropea, Novara, cogu havluluk ve aski
Novara ozel: Duvara bantla monte edilir. Ic montaj vidasi gevserse asma kismi doner, tornavida ile ic vidayi sik.
Hem yapiskanlı hem vidali: Piatto-Satine, pakette vida + dubel + vida kapaklari gelir
Vidali montaj isteyen musterilere magazada vidali secenekler oldugunu soyle.

## URUN OLCU VE RENKLERI
- Altomonte: 40cm ve 50cm var. 30cm/35cm YOK. 50cm icin magazada "Altomonte 50cm" ara.
- Yapiskanlı Dus Rafi gri/inoks: Tekli satis YOK, 2'li model var, magazada "dus rafi" ara
- Vintage WC Fircasi: Beyaz versiyonu VAR, magazada "beyaz firca" ara
- Blackstilo3: Tek boy, daha uzun versiyonu yok
- Gold rengi: Cogu urunde henuz yok, uretim planlaniyor
- Bakir/pirinc rengi: Mevcut degil
- Gumus rengi: "gri inoks" secenegi var, gumus tonundadir
- 2'li Siena: Genislik 10cm, Uzunluk 30cm, Kalinlik 2mm
- Yapiskanlı Paslanmaz Siena kalinligi: 2mm, 0.8mm DEGIL
- Alezio derinlik: 4cm
- C-Havluluk: 40x6x7cm
- Black-Gualdo: 35x13cm, yapiskanlı, vidali DEGIL
- Satine Ravenna Cop Kovasi: Yukseklik 27cm, Cap 26.5cm
- Tyc00202445581 ic bosluk: 45mm
- Dus Kose Rafi kalinlik: 1.5mm

## GARANTI VE KALITE
- Tum urunler 304 kalite birinci sinif paslanmaz celik
- OMUR BOYU GARANTi, asla "2 yil" deme
- Siyah urunler: 304 paslanmaz celik + uzerine elektrostatik toz boya
- Paslanma nadir olur: asit bazli temizleyici, camasir suyu, bazi sampuan kimyasallari yapiyi bozabilir
- Paslanma durumunda bile: degisim veya iade yapilir, ne kadar sure gecmis olursa olsun
- Musteri hatasi bile olsa: ucretsiz yapistirma kiti, degisim veya iade yapilir

## FIYAT SORULARI
"Fiyatlar Trendyol'un teklifleri dogrultusunda her hafta degismektedir. Yildizli indirimlere girdiginde 3-4 hafta devam eder. Indirimlerden haberdar olmak icin urunu favorilerinize ekleyin. Bu degisiklikler bizden bagimsiz Trendyol teklif ve kampanya sistemiyle belirlenmektedir."

## KARGO
Oglen 12'ye kadar ayni gun, sonrasi ayni gun veya ertesi gun.
Kargo firmasi: Once Trendyol Express, bolgede yoksa diger kargolar.

## DIGER SIKCA SORULANLAR
- Fon makinesi var mi icinde Dyson standi: "Bu urun sadece stand olup sac kurutma makinesi dahil degildir."
- Bant suya dayanikli mi: "Evet dayaniklidir. Ilk 24 saat su temasi olmamalidir."
- Hediye ceki: YOK
- Tester parfum: GONDERMIYORUZ
- Boyali duvara yapisirir mi: "Evet, yuzeyin temiz ve kuru olmasi yeterlidir."
- Ahsap/MDF laminat yuzeye yapisirir mi: "Evet, rahatliklaa yapisirir."
- Tasinirken sokup tekrar kullanabilir miyim: "Sokulabilir ama yapiskanligi kaybolur, yeni bant gerekir, magazamizdan alabilirsiniz."
- Kac kilo tasir: "Her aski yaklasik 3-5 kg."
- Bornoz askisi tekli satis: YOK, sadece 2'li satiliyor
- 2234c Akilli Klozet: Kanalsiz Rimless. Gomme rezervuar sete dahil. Rezervuar kullanilmazsa oto sifon calismaz.
- Omur boyu garanti kac yil: "Belirli bir yil siniri yoktur, omur boyu garantidir."

## ASLA YAPMA
- "2 yil garantilidir" de, omur boyu de
- "Dyson standi fon makinelerine uyumludur" YANLIS
- "1-2 gunde stok gelir" kesin tarih verme
- "Yapistiriciyi bandin uzerine surun" YANLIS, banda surulmez
- "Dreame ile uyumlu" UYUMLU DEGIL
- "Altomonte 50cm yok" VAR
- "Siena 0.8mm" 2mm
`;

function App() {
  const [soru, setSoru] = useState('');
  const [urunAdi, setUrunAdi] = useState('');
  const [cevap, setCevap] = useState('');
  const [benzerler, setBenzerler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [dbStats, setDbStats] = useState({ sorular: 0, kurallar: 0, onaylanan: 0 });
  const [showBenzerler, setShowBenzerler] = useState(false);

  const [showDuzeltme, setShowDuzeltme] = useState(false);
  const [duzeltmeNotu, setDuzeltmeNotu] = useState('');
  const [duzeltmeLoading, setDuzeltmeLoading] = useState(false);
  const [duzeltilmisCevap, setDuzeltilmisCevap] = useState('');

  const [kurallar, setKurallar] = useState([]);
  const [urunBilgileri, setUrunBilgileri] = useState([]);

  useEffect(() => {
    const savedKey = localStorage.getItem('zift_api_key');
    if (savedKey) { setApiKey(savedKey); setTempApiKey(savedKey); }
    loadDbStats();
    loadKurallar();
    loadUrunBilgileri();
  }, []);

  const loadDbStats = async () => {
    const { count: soruCount } = await supabase.from('sorular').select('id', { count: 'exact', head: true });
    const { count: kuralCount } = await supabase.from('kurallar').select('id', { count: 'exact', head: true });
    const { count: onayCount } = await supabase.from('onaylanan_cevaplar').select('id', { count: 'exact', head: true });
    setDbStats({ sorular: soruCount || 0, kurallar: kuralCount || 0, onaylanan: onayCount || 0 });
  };

  const loadKurallar = async () => {
    const { data } = await supabase
      .from('kurallar')
      .select('kural, oncelik')
      .eq('aktif', true)
      .order('oncelik', { ascending: false });
    setKurallar(data || []);
  };

  const loadUrunBilgileri = async () => {
    const { data } = await supabase.from('urun_bilgileri').select('urun_adi, bilgi_turu, bilgi');
    setUrunBilgileri(data || []);
  };

  const saveApiKey = () => {
    localStorage.setItem('zift_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setShowSettings(false);
  };

  const findSimilarQuestions = async (searchText) => {
    if (!searchText || searchText.length < 3) return [];
    const keywords = searchText.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 5);
    if (keywords.length === 0) return [];
    let results = [];

    for (const keyword of keywords.slice(0, 2)) {
      const { data } = await supabase.from('onaylanan_cevaplar')
        .select('soru, dogru_cevap, urun_adi').ilike('soru', `%${keyword}%`).limit(5);
      if (data) results = [...results, ...data.map(d => ({ soru: d.soru, cevap: d.dogru_cevap, urun_adi: d.urun_adi, kaynak: 'onaylanan' }))];
    }

    for (const keyword of keywords.slice(0, 3)) {
      const { data } = await supabase.from('sorular')
        .select('soru, cevap, urun_adi').ilike('soru', `%${keyword}%`).limit(5);
      if (data) results = [...results, ...data.map(d => ({ ...d, kaynak: 'eski' }))];
    }

    const unique = results.filter((item, index, self) => index === self.findIndex(t => t.soru === item.soru));
    unique.sort((a, b) => {
      if (a.kaynak === 'onaylanan' && b.kaynak !== 'onaylanan') return -1;
      if (a.kaynak !== 'onaylanan' && b.kaynak === 'onaylanan') return 1;
      return 0;
    });
    return unique.slice(0, 10);
  };

  const getUrunBilgileri = (urunAdi) => {
    if (!urunAdi) return [];
    return urunBilgileri.filter(u =>
      urunAdi.toLowerCase().includes(u.urun_adi.toLowerCase()) ||
      u.urun_adi.toLowerCase().includes(urunAdi.toLowerCase()) ||
      u.urun_adi === 'GENEL'
    );
  };

  const generateAnswer = async () => {
    if (!soru.trim()) return;
    if (!apiKey) { setShowSettings(true); return; }

    setLoading(true);
    setCevap('');
    setBenzerler([]);
    setCopied(false);
    setShowDuzeltme(false);
    setDuzeltilmisCevap('');
    setDuzeltmeNotu('');

    try {
      const similarQuestions = await findSimilarQuestions(soru);
      setBenzerler(similarQuestions);

      const urunBilgi = getUrunBilgileri(urunAdi);
      const kurallarText = kurallar.map((k, i) => `${i + 1}. ${k.kural}`).join('\n');

      let examplesText = '';
      if (similarQuestions.length > 0) {
        examplesText = '\n\n## BENZER SORULAR VE CEVAPLAR (bu tarzda cevap ver, onccelik onaylananlarda):\n';
        similarQuestions.slice(0, 5).forEach((q, i) => {
          const tag = q.kaynak === 'onaylanan' ? ' [ONAYLANMIS - BU TARZI KULLAN]' : '';
          examplesText += `\nOrnek ${i + 1}${tag}:\nSoru: ${q.soru}\nCevap: ${q.cevap}\n`;
        });
      }

      let urunText = '';
      if (urunBilgi.length > 0) {
        urunText = '\n\n## BU URUN HAKKINDA EK BILGILER:\n';
        urunBilgi.forEach(u => { urunText += `- ${u.urun_adi} (${u.bilgi_turu}): ${u.bilgi}\n`; });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `${TEMEL_BILGI}

## DAVRANIM KURALLARI (Supabase'den canli):
${kurallarText}
${urunText}
${examplesText}

Son not: [ONAYLANMIS] isaretli orneklerin tarzini oncelikli taklit et. Sadece cevabi yaz, aciklama ekleme. Asla yapay zeka oldugunden bahsetme.`,
          messages: [{
            role: 'user',
            content: `${urunAdi ? `Urun: ${urunAdi}\n` : ''}Musteri Sorusu: ${soru}\n\nBu soruya Zift Unique tarzinda kisa ve profesyonel bir cevap yaz.`
          }]
        })
      });

      const data = await response.json();
      if (data.error) { setCevap(`Hata: ${data.error.message}`); return; }
      setCevap(data.content?.[0]?.text || 'Cevap olusturulamadi.');
    } catch (error) {
      setCevap('Hata olustu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuzelt = async () => {
    if (!duzeltmeNotu.trim()) return;
    setDuzeltmeLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Sen Zift Unique musteri hizmetleri asistanisin. Duzeltme notuna gore yeni bir cevap uret. Duzeltme notu bozuk Turkce ile yazilmis olabilir, sen duzgun Turkce ile cevap yaz. Her zaman "Merhabalar" ile basla, sadece 1 kere "efendim" kullan. Sadece cevabi yaz, aciklama ekleme.',
          messages: [{
            role: 'user',
            content: `Musteri Sorusu: ${soru}\n\nYanlis Cevap: ${cevap}\n\nDuzeltme Notu: ${duzeltmeNotu}\n\nBu duzeltme notuna gore yeni dogru cevabi yaz.`
          }]
        })
      });
      const data = await response.json();
      if (data.error) { alert('Hata: ' + data.error.message); return; }
      setDuzeltilmisCevap(data.content?.[0]?.text || '');
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setDuzeltmeLoading(false);
    }
  };

  const handleOnayla = async () => {
    try {
      await supabase.from('onaylanan_cevaplar').insert({
        soru, urun_adi: urunAdi || null,
        yanlis_cevap: cevap, dogru_cevap: duzeltilmisCevap, duzeltme_notu: duzeltmeNotu
      });
      setCevap(duzeltilmisCevap);
      setShowDuzeltme(false);
      setDuzeltilmisCevap('');
      setDuzeltmeNotu('');
      loadDbStats();
      navigator.clipboard.writeText(duzeltilmisCevap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Kaydetme hatasi: ' + error.message);
    }
  };

    const copyToClipboard = async () => {
    navigator.clipboard.writeText(cevap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateAnswer(); }
  };

  const usePreviousAnswer = (item) => { setCevap(item.cevap); setShowBenzerler(false); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">🛁 Zift Unique Asistan</h1>
            <p className="text-slate-400 text-xs">
              📚 {dbStats.sorular.toLocaleString()} soru • 📋 {dbStats.kurallar} kural • ✅ {dbStats.onaylanan} öğrenilmiş
            </p>
          </div>
          <button onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }}
            className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors" title="Ayarlar">⚙️</button>
        </div>

        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">⚠️ API anahtarı gerekli. <button onClick={() => setShowSettings(true)} className="underline font-medium">Ayarlar'dan</button> ekleyin.</p>
          </div>
        )}

        {/* Input Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">Ürün Adı <span className="text-slate-500">(opsiyonel)</span></label>
            <input type="text" value={urunAdi} onChange={(e) => setUrunAdi(e.target.value)}
              placeholder="Örn: Paslanmaz Çelik Havluluk"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">Müşteri Sorusu <span className="text-red-400">*</span></label>
            <textarea value={soru} onChange={(e) => setSoru(e.target.value)} onKeyPress={handleKeyPress}
              placeholder="Müşterinin sorusunu buraya yapıştırın..." rows={3}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
          </div>
          <button onClick={generateAnswer} disabled={loading || !soru.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${loading || !soru.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25'}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cevap Üretiliyor...
              </span>
            ) : '✨ Cevap Üret'}
          </button>
        </div>

        {/* Answer Card */}
        {cevap && !showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">📝 Önerilen Cevap</h2>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-4">
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{cevap}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={copyToClipboard}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                {copied ? '✓ Kopyalandı!' : '✓ Kopyala'}
              </button>
              <button onClick={() => setShowDuzeltme(true)}
                className="flex-1 py-3 rounded-xl font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                ❌ Yanlış
              </button>
            </div>
          </div>
        )}

        {/* Düzeltme Paneli */}
        {showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-orange-500/30 mb-6">
            <h2 className="text-lg font-semibold text-orange-400 mb-4">🔧 Düzeltme</h2>
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700 mb-4">
              <p className="text-slate-400 text-sm mb-1">Yanlış Cevap:</p>
              <p className="text-slate-300 text-sm">{cevap}</p>
            </div>
            {!duzeltilmisCevap ? (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-medium mb-2">Ne yanlış? <span className="text-slate-500">(kısa not yeterli, bozuk Türkçe de olur)</span></label>
                  <textarea value={duzeltmeNotu} onChange={(e) => setDuzeltmeNotu(e.target.value)}
                    placeholder="Örn: 3 adet geliyo 1 deil, hediye yok dememiz lazım..." rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowDuzeltme(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">İptal</button>
                  <button onClick={handleDuzelt} disabled={duzeltmeLoading || !duzeltmeNotu.trim()}
                    className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${duzeltmeLoading || !duzeltmeNotu.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500'}`}>
                    {duzeltmeLoading ? '⏳ Düzeltiliyor...' : '🔧 Düzelt'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 mb-4">
                  <p className="text-green-400 text-sm mb-1">✓ Düzeltilmiş Cevap:</p>
                  <p className="text-slate-200">{duzeltilmisCevap}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setDuzeltilmisCevap(''); setDuzeltmeNotu(''); }}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">Hala Yanlış</button>
                  <button onClick={handleOnayla} className="flex-1 py-3 rounded-xl font-medium text-white bg-green-600 hover:bg-green-500 transition-colors">✓ Tamam, Kaydet</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Benzer Sorular */}
        {benzerler.length > 0 && !showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <button onClick={() => setShowBenzerler(!showBenzerler)} className="flex items-center justify-between w-full text-left">
              <h2 className="text-lg font-semibold text-white">🔍 Benzer Sorular ({benzerler.length})</h2>
              <span className="text-slate-400">{showBenzerler ? '▲' : '▼'}</span>
            </button>
            {showBenzerler && (
              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {benzerler.map((item, index) => (
                  <button key={index} onClick={() => usePreviousAnswer(item)}
                    className={`w-full text-left rounded-xl p-4 transition-colors ${item.kaynak === 'onaylanan' ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
                    {item.kaynak === 'onaylanan' && <span className="text-green-400 text-xs mb-1 block">✓ Öğrenilmiş</span>}
                    <p className="text-white text-sm font-medium mb-1">{item.soru}</p>
                    <p className="text-slate-400 text-xs line-clamp-2">{item.cevap}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">💡 Kopyala = öğrenir • Yanlış = düzeltip öğretirsin</p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ Ayarlar</h3>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">Anthropic API Anahtarı</label>
              <input type="password" value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} placeholder="sk-ant-..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
              <p className="text-slate-500 text-xs mt-2">
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">console.anthropic.com</a> adresinden alın.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">İptal</button>
              <button onClick={saveApiKey} className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
