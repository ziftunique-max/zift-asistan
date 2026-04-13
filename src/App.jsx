import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xnzlzzxstnjohvflfyrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuemx6enhzdG5qb2h2ZmxmeXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjIzMDMsImV4cCI6MjA4NTUzODMwM30.rfkipXFe6PR8XWJ4iSwHOThJs5cL9sSjU8QsM1XUktc'
);

const VARSAYILAN_ESLESTIRME = [
  { barkod: "5ltçöpkovası", isim: "mat siyah çöp", model_kodu: "VİNTAGE5LTÇÖPKOVASI" },
  { barkod: "banyoaksesuarseti", isim: "yapışkanlı set", model_kodu: "4 PARÇA BANYO SETİ" },
  { barkod: "banyohavluluksetiaksesuar", isim: "yapışkanlı set", model_kodu: "4 PARÇA PASLANMAZ BANYO SETİ" },
  { barkod: "bl2234C", isim: "klozet", model_kodu: "2234C" },
  { barkod: "blackcamaskılık", isim: "cam askılık", model_kodu: "DUŞAKABİN-ASKILIK" },
  { barkod: "BlackStilo3", isim: "stilo", model_kodu: "BlackStilo3" },
  { barkod: "blacktropea", isim: "tropea", model_kodu: "TROPEA-BLACK" },
  { barkod: "bornozaskısıhooks", isim: "hooks", model_kodu: "2 PASLANMAZ BORNOZ ASKISI HOOKS" },
  { barkod: "c-havlu-düzenleyici", isim: "c havluluk", model_kodu: "C-HAVLULUK" },
  { barkod: "c-havlu-düzenleyici-yapışkanlı", isim: "c havluluk", model_kodu: "C-HAVLULUK" },
  { barkod: "çöpkovasıpaslanmaz", isim: "satine çöp", model_kodu: "SATİNE YÜZEY RAVENNA ÇÖP KUTUSU" },
  { barkod: "duşsetishower", isim: "duş başlık", model_kodu: "duşseti" },
  { barkod: "dysonairwrapstand", isim: "airwrap", model_kodu: "DYSON AİRWRAP AKSESUAR STANDI" },
  { barkod: "fönmakinesiaskılıgı", isim: "monea", model_kodu: "ASKILIK & FÖN MAKİNESİ TUTACAĞI" },
  { barkod: "havluaskısıpaslanmaz", isim: "2li hooks", model_kodu: "YAPIŞKANLI PASLANMAZ HOOKS" },
  { barkod: "havlubornozaskı", isim: "altamonte hooks", model_kodu: "altamontehavlulukaskıhooks" },
  { barkod: "hrdikdörtgenayna", isim: "dikdörtgen horow", model_kodu: "dikdörtgenayna" },
  { barkod: "hrmatsiyahbatarya", isim: "batarya", model_kodu: "matsiyahbatarya" },
  { barkod: "hrovalayna", isim: "yuvarlak horow", model_kodu: "ovalayna" },
  { barkod: "KAĞITHAVLULUKSTANDBLACK", isim: "stand kağıthavlu", model_kodu: "KAĞITHAVLU-STAND" },
  { barkod: "KAĞITHAVLULUKSTANDİNOKS", isim: "stand kağıthavlu", model_kodu: "KAĞITHAVLU-STAND" },
  { barkod: "matsiyahçöpkovası", isim: "mat siyah çöp", model_kodu: "MATBLACKÇÖPKOVASI" },
  { barkod: "matsiyahwcfırça", isim: "mat siyah fırça", model_kodu: "MAT SİYAH WC FIRÇA" },
  { barkod: "ovalaskılık", isim: "oval hooks", model_kodu: "YAPIŞKANLI ÇOK AMAÇLI OVAL ASKILIK" },
  { barkod: "paslanmazkağıthavluluk", isim: "cortona", model_kodu: "PASLANMAZ CORTONA" },
  { barkod: "paslanmazwcfırçatakımı", isim: "vintage fırça", model_kodu: "VİNTAGE-MATSİYAHWCFIRÇASI" },
  { barkod: "raflıpaslanmazhavluluk", isim: "toskana", model_kodu: "TOSKANA SATİNE" },
  { barkod: "raflıwcaskısıtuvalet", isim: "siena", model_kodu: "YAPIŞKANLI PASLANMAZ SİNEA" },
  { barkod: "satinegualdonew", isim: "gualdo", model_kodu: "BLACK-GUALDO" },
  { barkod: "satinewcfırçatakımı", isim: "satine wc fırça", model_kodu: "SatineWCFIRÇA" },
  { barkod: "siyahbornozaskıhooks", isim: "2li hooks", model_kodu: "LİF & BORNOZ & ASKI" },
  { barkod: "siyahhavluaskıhooks", isim: "altamonte hooks", model_kodu: "45cm Havluluk&2 Hooks" },
  { barkod: "siyahhavluaskısı", isim: "2li hooks", model_kodu: "banyomutfakikiliaskı" },
  { barkod: "standhavluluksiyah", isim: "stand havluluk", model_kodu: "HAVLU-STAND" },
  { barkod: "şampuanrafıduşiçi", isim: "piatto", model_kodu: "PİATTO-SATİNE" },
  { barkod: "vintagebeyazçöp", isim: "vintage çöp", model_kodu: "Beyaz Vintage Çöp Kova" },
  { barkod: "yapışkanlıbanyorafı", isim: "piatto", model_kodu: "PİATTO - Yapışkanlı Raf" },
  { barkod: "ZiftHome-1qweqwe", isim: "veneto", model_kodu: "ZiftHomeHavluluk2" },
  { barkod: "ZiftHome-40834724487512", isim: "stilo", model_kodu: "ZiftHomeHavluluk" },
  { barkod: "ZiftHomeAltomonte-196123234", isim: "altamonte", model_kodu: "Altomonte" },
  { barkod: "raflıwcaskılıkbanyo", isim: "siena", model_kodu: "YAPIŞKANLI PASLANMAZ SİNEA" },
  { barkod: "smodelkanca", isim: "kanca", model_kodu: "S KANCA ON ADET" },
  { barkod: "havlulukmatsiyahaltamonte", isim: "altamonte", model_kodu: "45CM-SİYAH HAVLULUK" },
  { barkod: "tuvaletkağıdıaskısıhavluaskısı", isim: "stilo spello set", model_kodu: "HAVLULUK & TUVALET KAĞIDI TUTACAĞI" },
  { barkod: "VenetoBlack", isim: "veneto", model_kodu: "TYC00202445581" },
  { barkod: "yapışkanlıhavluaskısı", isim: "toskana", model_kodu: "MAT SİYAH TOSKANA" },
  { barkod: "duşköşerafı", isim: "tropea", model_kodu: "DUŞ KÖŞE RAFI" },
  { barkod: "rulokağıthavluaskısı", isim: "cortona", model_kodu: "PASLANMAZ CORTONA" },
  { barkod: "siyah-alezio", isim: "alezio black", model_kodu: "Alezio-siyah" },
  { barkod: "satine-milliaskılık", isim: "milli cam askılık", model_kodu: "milliaskılık-satine" },
  { barkod: "fönmakinesitutacagıaskılık", isim: "monea", model_kodu: "ASKILIK  APARATLI&FÖN MAKİNESİ TUTACAĞI" },
  { barkod: "JR-GUALDO-BLACK", isim: "jr gualdo", model_kodu: "JR-GUALDO" },
  { barkod: "wckağıdıaskısıpienzamatsiyah", isim: "pienza", model_kodu: "BLACK PİENZA" },
  { barkod: "dysonmultislyerstand", isim: "airwrap", model_kodu: "TYC0839835001MDYSON Aİ005" },
  { barkod: "fönmakinesiaskısıyapışkan", isim: "modica", model_kodu: "Paslanmaz Askılık MODİCA" },
  { barkod: "gualdoblacknew", isim: "gualdo", model_kodu: "BLACK-GUALDO" },
  { barkod: "havlubornozaskısıpaslanmaz", isim: "hooks", model_kodu: "TYC00797134020" },
  { barkod: "silikonyapıştırıcı", isim: "bant", model_kodu: "SİLİKON BANT JELATİN" },
  { barkod: "JR-GUALDO-İNOKS", isim: "jr gualdo", model_kodu: "JR-GUALDO" },
  { barkod: "ZiftHome.BkmlHavllk72570128321", isim: "castel", model_kodu: "BükümlüHavlulukZiftUnique" },
  { barkod: "ZiftUnique46cmHavluluk.123246692", isim: "altamonte", model_kodu: "ZiftUnique46cmHavluluk" },
  { barkod: "standhavlulukinoks", isim: "stand havluluk", model_kodu: "HAVLU-STAND" },
  { barkod: "TA-E71DF", isim: "klozet", model_kodu: "TA-E71DF" },
  { barkod: "vintagebeyazwcfırça", isim: "vintage wc fırça", model_kodu: "BEYAZ-VİNTAGE" },
  { barkod: "wckağıdıaskılık", isim: "spello", model_kodu: "Black Monza" },
  { barkod: "ZiftHomeBkmlKh.323412", isim: "novara", model_kodu: "ZiftHomeKağıtHavlulukBKML" },
  { barkod: "yapışkanlıwcseti", isim: "stilo pienza set", model_kodu: "STİLO&PİENZA SET" },
  { barkod: "paslanmazwcfırçası", isim: "yapışkanlı wc fırça", model_kodu: "YAPIIŞKANLI-WC-FIRÇA" },
  { barkod: "ovalhavluaskısı", isim: "oval hooks", model_kodu: "YAPIŞKANLI ÇOK AMAÇLI OVAL ASKILIK" },
  { barkod: "paslanmazserthavluaskısı", isim: "stilo spello set", model_kodu: "HAVLULUK-TUVALET KAĞITLIĞI SET" },
  { barkod: "camaskılıkinoks", isim: "cam askılık", model_kodu: "DUŞAKABİN-ASKILIK" },
  { barkod: "yapışkanlıduşrafı", isim: "piatto", model_kodu: "YAPIŞKANLI DUŞ RAFI" },
  { barkod: "yapışkanlıwcbanyoset", isim: "stilo pienza set", model_kodu: "STİLO&PİENZA SET" },
  { barkod: "ZiftHome-YeniTk11465754", isim: "spello", model_kodu: "tuvaletkagıtlık" },
  { barkod: "sienasatineçift", isim: "2li siena", model_kodu: "sienasatineçift" },
  { barkod: "tuvaletkağıdıasacağı", isim: "pienza", model_kodu: "PİENZA" },
  { barkod: "siyah-milliaskılık", isim: "siyah camaskılık", model_kodu: "milliaskılık-siyah" },
  { barkod: "eylül-wc-fırça", isim: "satine wc fırça", model_kodu: "eylül-wc-fırça" },
  { barkod: "dysonsüpürgestand", isim: "süpürge stand", model_kodu: "Dyson-Süpürge-Stand" },
  { barkod: "yapışkanlıtuvaletkağıdıaskısı", isim: "gold spello", model_kodu: "GOLD SPELLO" },
  { barkod: "goldhavluaskısı", isim: "gold novara", model_kodu: "PASLANMAZ GOLD NOVARA KAĞITHAVLU ASKISI" },
  { barkod: "goldhavlulukpaslanmaz", isim: "gold hooks", model_kodu: "GOLD HOOKS" },
  { barkod: "goldpaslanmazhavluluk", isim: "gold altamonte", model_kodu: "ALTAMONTE GOLD" },
  { barkod: "füme-alezio", isim: "füme alezio", model_kodu: "Alezio-Füme" },
  { barkod: "BEYAZAYAKSTAND01", isim: "yamazaki", model_kodu: "BEYAZ-AYAK-AHSAP-STAND" },
  { barkod: "axor-titanyum", isim: "axor füme", model_kodu: "Axor-titanyum-füme" },
  { barkod: "2adetbambuodakokusu", isim: "2li koku", model_kodu: "POWDER-FRESH" },
  { barkod: "bambucubukluodakokusu2adet", isim: "2li koku", model_kodu: "SOFT-COTTON&LİNEN" },
  { barkod: "freshflowersbambuodakokusu", isim: "fresh", model_kodu: "FreshFlowers04" },
  { barkod: "SmoothLinenbambuodakokusu", isim: "smooth", model_kodu: "SmoothLinen02" },
  { barkod: "softcottonbambudakokusu", isim: "soft", model_kodu: "SoftCotton03" },
  { barkod: "bambuodakokusupowdercharm", isim: "powder", model_kodu: "NO1POWDERCHARM" },
  { barkod: "beyaz-siena", isim: "siena", model_kodu: "beyaz-siena" },
  { barkod: "veneto-beyaz", isim: "veneto", model_kodu: "veneto-beyaz" },
  { barkod: "black-2lisiena", isim: "2li siena", model_kodu: "black-2'lisiena" },
  { barkod: "beyaz-jr-gualdo", isim: "jr gualdo", model_kodu: "jr-beyaz-GUALDO" },
  { barkod: "spello-gualdo-black-set", isim: "spello gualdo set", model_kodu: "spello-gualdo-black" },
  { barkod: "black-gss", isim: "gualdo stilo spello set", model_kodu: "gualdo-spello-stilo" },
  { barkod: "inoks-gss", isim: "gualdo stilo spello set", model_kodu: "gualdo-spello-stilo" },
  { barkod: "siyah-banyo-set-SG", isim: "stilo gualdo set", model_kodu: "gualdo-stilo" },
  { barkod: "inoks-banyo-set-SG", isim: "stilo gualdo set", model_kodu: "gualdo-stilo" },
  { barkod: "25525252552", isim: "hooks", model_kodu: "PASLANMAZ HOOKS" },
  { barkod: "4785283863863", isim: "novara", model_kodu: "ZiftHomeKağıtHavlulukBKML" },
  { barkod: "7548968575245", isim: "spello", model_kodu: "BLCSTL1" },
  { barkod: "8684617960388", isim: "mermer siena", model_kodu: "12mm Mermerli Mat Siyah Stand" },
  { barkod: "25445545556655", isim: "hooks", model_kodu: "PASLANMAZ HOOKS" },
  { barkod: "44774714477474", isim: "2li hooks", model_kodu: "LİF & BORNOZ & ASKI" },
];

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
- Yapiskanlı Dus Rafi gri/inoks: Tekli satis YOK, 2li model var, magazada "dus rafi" ara
- Vintage WC Fircasi: Beyaz versiyonu VAR, magazada "beyaz firca" ara
- Blackstilo3: Tek boy, daha uzun versiyonu yok
- Gold rengi: Cogu urunde henuz yok, uretim planlaniyor
- Bakir/pirinc rengi: Mevcut degil
- Gumus rengi: "gri inoks" secenegi var, gumus tonundadir
- 2li Siena: Genislik 10cm, Uzunluk 30cm, Kalinlik 2mm
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
Oglen 12ye kadar ayni gun, sonrasi ayni gun veya ertesi gun.
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
- Bornoz askisi tekli satis: YOK, sadece 2li satiliyor
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

  // Ürün seçici
  const [eslestirme, setEslestirme] = useState([]);
  const [format, setFormat] = useState('isim');
  const [dropdownAcik, setDropdownAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliUrun, setSeciliUrun] = useState(null);
  const dropdownRef = useRef(null);
  const aramaInputRef = useRef(null);

  // Ürün yönetimi
  const [showUrunYonetim, setShowUrunYonetim] = useState(false);
  const [yeniUrun, setYeniUrun] = useState({ barkod: '', isim: '', model_kodu: '' });
  const [duzenleIndex, setDuzenleIndex] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('zift_api_key');
    if (savedKey) { setApiKey(savedKey); setTempApiKey(savedKey); }
    const savedEslestirme = localStorage.getItem('zift_eslestirme');
    if (savedEslestirme) {
      setEslestirme(JSON.parse(savedEslestirme));
    } else {
      setEslestirme(VARSAYILAN_ESLESTIRME);
      localStorage.setItem('zift_eslestirme', JSON.stringify(VARSAYILAN_ESLESTIRME));
    }
    loadDbStats();
    loadKurallar();
    loadUrunBilgileri();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAcik(false);
        setAramaMetni('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadDbStats = async () => {
    const { count: soruCount } = await supabase.from('sorular').select('id', { count: 'exact', head: true });
    const { count: kuralCount } = await supabase.from('kurallar').select('id', { count: 'exact', head: true });
    const { count: onayCount } = await supabase.from('onaylanan_cevaplar').select('id', { count: 'exact', head: true });
    setDbStats({ sorular: soruCount || 0, kurallar: kuralCount || 0, onaylanan: onayCount || 0 });
  };

  const loadKurallar = async () => {
    const { data } = await supabase.from('kurallar').select('kural, oncelik').eq('aktif', true).order('oncelik', { ascending: false });
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

  const secilenModelKodlari = () => {
    if (!seciliUrun) return [];
    const kodlar = new Set();
    eslestirme.forEach(item => {
      if (format === 'isim' && item.isim === seciliUrun.isim) kodlar.add(item.model_kodu);
      else if (format === 'barkod' && item.barkod === seciliUrun.barkod) kodlar.add(item.model_kodu);
      else if (format === 'modelkodu' && item.model_kodu === seciliUrun.model_kodu) kodlar.add(item.model_kodu);
    });
    return Array.from(kodlar);
  };

  const filtreliListe = () => {
    const q = aramaMetni.toLowerCase();
    if (!q) return eslestirme;
    return eslestirme.filter(item => {
      if (format === 'isim') return item.isim.toLowerCase().includes(q);
      if (format === 'barkod') return item.barkod.toLowerCase().includes(q);
      if (format === 'modelkodu') return item.model_kodu.toLowerCase().includes(q);
      return false;
    });
  };

  const dropdownLabel = (item) => {
    if (format === 'isim') return item.isim;
    if (format === 'barkod') return item.barkod;
    return item.model_kodu;
  };

  const findSimilarQuestions = async (searchText, modelKodlari) => {
    if (!searchText || searchText.length < 3) return [];
    const keywords = searchText.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 5);
    if (keywords.length === 0) return [];
    let results = [];

    for (const keyword of keywords.slice(0, 2)) {
      let q = supabase.from('onaylanan_cevaplar').select('soru, dogru_cevap, urun_adi').ilike('soru', `%${keyword}%`).limit(5);
      if (modelKodlari.length > 0) q = q.in('model_kodu', modelKodlari);
      const { data } = await q;
      if (data) results = [...results, ...data.map(d => ({ soru: d.soru, cevap: d.dogru_cevap, urun_adi: d.urun_adi, kaynak: 'onaylanan' }))];
    }

    for (const keyword of keywords.slice(0, 3)) {
      let q = supabase.from('sorular').select('soru, cevap, urun_adi').ilike('soru', `%${keyword}%`).limit(5);
      if (modelKodlari.length > 0) q = q.in('model_kodu', modelKodlari);
      const { data } = await q;
      if (data) results = [...results, ...data.map(d => ({ ...d, kaynak: 'eski' }))];
    }

    const unique = results.filter((item, index, self) => index === self.findIndex(t => t.soru === item.soru));
    unique.sort((a, b) => (a.kaynak === 'onaylanan' ? -1 : 1));
    return unique.slice(0, 10);
  };

  const getUrunBilgileri = (modelKodlari) => {
    if (!modelKodlari || modelKodlari.length === 0) return urunBilgileri.filter(u => u.urun_adi === 'GENEL');
    return urunBilgileri.filter(u =>
      u.urun_adi === 'GENEL' ||
      modelKodlari.some(k => u.urun_adi && (
        u.urun_adi.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(u.urun_adi.toLowerCase())
      ))
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
      const modelKodlari = secilenModelKodlari();
      const similarQuestions = await findSimilarQuestions(soru, modelKodlari);
      setBenzerler(similarQuestions);

      const urunBilgi = getUrunBilgileri(modelKodlari);
      const kurallarText = kurallar.map((k, i) => `${i + 1}. ${k.kural}`).join('\n');

      let examplesText = '';
      if (similarQuestions.length > 0) {
        examplesText = '\n\n## BENZER SORULAR VE CEVAPLAR (bu tarzda cevap ver, oncelik onaylananlarda):\n';
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

      let urunKapsam = '';
      if (modelKodlari.length > 0) {
        urunKapsam = `\n\n## URUN KAPSAMI:\nBu soru su urun(ler) hakkinda: ${modelKodlari.join(', ')}\nSadece bu urun(ler) hakkinda cevap ver.`;
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
          system: `${TEMEL_BILGI}\n\n## DAVRANIM KURALLARI (Supabase'den canli):\n${kurallarText}${urunKapsam}${urunText}${examplesText}\n\nSon not: [ONAYLANMIS] isaretli orneklerin tarzini oncelikli taklit et. Sadece cevabi yaz, aciklama ekleme. Asla yapay zeka oldugunden bahsetme.`,
          messages: [{
            role: 'user',
            content: `${seciliUrun ? `Urun: ${seciliUrun.isim} (${modelKodlari.join(', ')})\n` : ''}Musteri Sorusu: ${soru}\n\nBu soruya Zift Unique tarzinda kisa ve profesyonel bir cevap yaz.`
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
      const modelKodlari = secilenModelKodlari();
      await supabase.from('onaylanan_cevaplar').insert({
        soru,
        urun_adi: seciliUrun ? seciliUrun.isim : null,
        model_kodu: modelKodlari.join(', ') || null,
        yanlis_cevap: cevap,
        dogru_cevap: duzeltilmisCevap,
        duzeltme_notu: duzeltmeNotu
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cevap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateAnswer(); }
  };

  const usePreviousAnswer = (item) => { setCevap(item.cevap); setShowBenzerler(false); };

  const eslestirmeKaydet = (yeniListe) => {
    setEslestirme(yeniListe);
    localStorage.setItem('zift_eslestirme', JSON.stringify(yeniListe));
  };
  const urunEkle = () => {
    if (!yeniUrun.barkod || !yeniUrun.isim || !yeniUrun.model_kodu) return;
    if (duzenleIndex !== null) {
      const liste = [...eslestirme]; liste[duzenleIndex] = yeniUrun;
      eslestirmeKaydet(liste); setDuzenleIndex(null);
    } else { eslestirmeKaydet([...eslestirme, yeniUrun]); }
    setYeniUrun({ barkod: '', isim: '', model_kodu: '' });
  };
  const urunSil = (i) => eslestirmeKaydet(eslestirme.filter((_, idx) => idx !== i));
  const urunDuzenle = (i) => { setYeniUrun({ ...eslestirme[i] }); setDuzenleIndex(i); };
  const resetVarsayilan = () => eslestirmeKaydet(VARSAYILAN_ESLESTIRME);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">🛁 Zift Unique Asistan</h1>
            <p className="text-slate-400 text-xs">
              📚 {dbStats.sorular.toLocaleString()} soru • 📋 {dbStats.kurallar} kural • ✅ {dbStats.onaylanan} öğrenilmiş
            </p>
          </div>
          <button onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }}
            className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors">⚙️</button>
        </div>

        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">⚠️ API anahtarı gerekli. <button onClick={() => setShowSettings(true)} className="underline font-medium">Ayarlar'dan</button> ekleyin.</p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">

          {/* Format seçici */}
          <div className="flex gap-2 mb-3">
            {[['isim', '🏷️ İsim'], ['barkod', '📦 Barkod'], ['modelkodu', '🔑 Model']].map(([val, label]) => (
              <button key={val} onClick={() => { setFormat(val); setSeciliUrun(null); setAramaMetni(''); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${format === val ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Ürün dropdown */}
          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block text-slate-300 text-sm font-medium mb-2">Ürün <span className="text-slate-500">(opsiyonel)</span></label>
            <div onClick={() => { setDropdownAcik(!dropdownAcik); setTimeout(() => aramaInputRef.current?.focus(), 50); }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white cursor-pointer flex justify-between items-center hover:border-slate-500 transition-colors">
              <span>
                {seciliUrun ? (
                  <>
                    <span className="text-blue-400 font-medium">{dropdownLabel(seciliUrun)}</span>
                    {format !== 'modelkodu' && <span className="text-slate-500 text-xs ml-2">{secilenModelKodlari().join(', ')}</span>}
                  </>
                ) : <span className="text-slate-500">🌐 Genel (tüm ürünler)</span>}
              </span>
              <span className="text-slate-500 text-xs ml-2">{dropdownAcik ? '▲' : '▼'}</span>
            </div>

            {dropdownAcik && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '300px' }}>
                <input ref={aramaInputRef} value={aramaMetni} onChange={e => setAramaMetni(e.target.value)}
                  placeholder={`${format === 'isim' ? 'İsim' : format === 'barkod' ? 'Barkod' : 'Model kodu'} ara...`}
                  className="bg-slate-900 border-b border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none flex-shrink-0" />
                <div className="overflow-y-auto">
                  <div onClick={() => { setSeciliUrun(null); setDropdownAcik(false); setAramaMetni(''); }}
                    className={`px-4 py-2.5 cursor-pointer text-sm border-b border-slate-700 transition-colors ${!seciliUrun ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:bg-slate-700'}`}>
                    🌐 Genel
                  </div>
                  {filtreliListe().map((item, i) => (
                    <div key={i} onClick={() => { setSeciliUrun(item); setDropdownAcik(false); setAramaMetni(''); }}
                      className={`px-4 py-2.5 cursor-pointer text-sm flex justify-between items-center transition-colors hover:bg-slate-700 ${seciliUrun && dropdownLabel(seciliUrun) === dropdownLabel(item) ? 'bg-blue-500/10 text-blue-400' : 'text-slate-200'}`}>
                      <span className="font-medium">{dropdownLabel(item)}</span>
                      {format !== 'modelkodu' && <span className="text-slate-500 text-xs ml-4 truncate">{item.model_kodu}</span>}
                    </div>
                  ))}
                  {filtreliListe().length === 0 && <div className="px-4 py-3 text-slate-500 text-sm text-center">Sonuç bulunamadı</div>}
                </div>
              </div>
            )}
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
            <div className="flex gap-3 mb-3">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">İptal</button>
              <button onClick={saveApiKey} className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">Kaydet</button>
            </div>
            <button onClick={() => { setShowSettings(false); setShowUrunYonetim(true); }}
              className="w-full py-2.5 rounded-xl text-sm text-slate-400 border border-slate-600 hover:bg-slate-700 transition-colors">
              📦 Ürün Eşleştirmelerini Yönet ({eslestirme.length} kayıt)
            </button>
          </div>
        </div>
      )}

      {showUrunYonetim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">📦 Ürün Eşleştirmeleri</h3>
              <div className="flex gap-2">
                <button onClick={resetVarsayilan} className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Sıfırla</button>
                <button onClick={() => setShowUrunYonetim(false)} className="px-3 py-1.5 text-xs text-slate-400 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">✕ Kapat</button>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 mb-4 grid grid-cols-3 gap-2 items-end">
              {[['Barkod', 'barkod'], ['İsim', 'isim'], ['Model Kodu', 'model_kodu']].map(([label, key]) => (
                <div key={key}>
                  <label className="text-xs text-slate-500 block mb-1">{label}</label>
                  <input value={yeniUrun[key]} onChange={e => setYeniUrun({ ...yeniUrun, [key]: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
                </div>
              ))}
              <button onClick={urunEkle} disabled={!yeniUrun.barkod || !yeniUrun.isim || !yeniUrun.model_kodu}
                className={`col-span-3 py-2 rounded-lg text-sm font-medium text-white transition-colors ${duzenleIndex !== null ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'} disabled:bg-slate-600 disabled:cursor-not-allowed`}>
                {duzenleIndex !== null ? '✏️ Güncelle' : '+ Ekle'}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1">
              <div className="grid grid-cols-4 gap-2 px-3 py-1 text-xs text-slate-500 font-semibold uppercase">
                <span>İsim</span><span>Barkod</span><span>Model Kodu</span><span></span>
              </div>
              {eslestirme.map((item, i) => (
                <div key={i} className={`grid grid-cols-4 gap-2 px-3 py-2 rounded-lg text-sm items-center ${duzenleIndex === i ? 'bg-orange-500/10' : i % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                  <span className="text-white font-medium truncate">{item.isim}</span>
                  <span className="text-slate-400 truncate text-xs">{item.barkod}</span>
                  <span className="text-slate-500 truncate text-xs">{item.model_kodu}</span>
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => urunDuzenle(i)} className="text-yellow-400 hover:text-yellow-300 p-1">✏️</button>
                    <button onClick={() => urunSil(i)} className="text-red-400 hover:text-red-300 p-1">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
