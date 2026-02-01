import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const supabase = createClient(
  'https://xnzlzzxstnjohvflfyrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuemx6enhzdG5qb2h2ZmxmeXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjIzMDMsImV4cCI6MjA4NTUzODMwM30.rfkipXFe6PR8XWJ4iSwHOThJs5cL9sSjU8QsM1XUktc'
);

const ZIFT_KNOWLEDGE = `
# ZİFT UNİQUE - ÜRÜN BİLGİ BANKASI

## GENEL BİLGİLER
- Tüm ürünler 304 kalite birinci sınıf paslanmaz çelikten üretilmektedir
- Ömür boyu paslanmama garantisi vardır
- Yapışkanlı sistem: Özel silikon bant ile monte edilir, vida gerektirmez
- Yapışma yüzeyleri: Fayans, cam, mermer, granit, düz duvar, duvar kağıdı (sağlam ise)
- İlk yapıştırmada talimatlara özen gösterilmeli, 24 saat beklenmeli
- Çıkartıp tekrar kullanılabilir (yeni bant ile)
- Renk seçenekleri: Gri inoks, Mat siyah, Gold (bazı modellerde)
- Hiçbir üründe renk atma veya solma olmaz

## ÜRÜN ÖLÇÜLERİ
- Banyo Rafı (Gualdo): 35cm x 13cm
- Havlu Standı: 30cm yükseklik
- Havluluk (46cm model): 46cm uzunluk, özel ölçü yapılabilir
- Veneto Havluluk: Stilo'dan 2-3cm daha uzun
- Tuvalet kağıtlığı sac kalınlığı: 2mm

## DYSON AIRWRAP STANDI
- Sadece stand satılır, fön makinesi ve parçalar DAHİL DEĞİLDİR
- Dyson Airwrap/Multistyler modellerine uyumludur
- Alt kısımda EVA sünger kaplama var, makine çizilmez

## DUŞ SİSTEMİ SETİ
- Elektrikli şofben için uygundur
- Batarya bağlantı boruları olması yeterli

## YAPIŞTIRICI BANT
- Çift taraflı silikon bant
- Yeterli yüzey alanı varsa 4-5kg taşıma kapasitesi
- Mağazada ayrıca satılmaktadır

## CEVAP TARZI
- Her zaman "Merhabalar" ile başla
- "efendim" kelimesini doğal kullan
- Kısa ve net cevaplar ver
- Pozitif ve yardımsever ol
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
  const [dbStats, setDbStats] = useState({ count: 0 });
  const [showBenzerler, setShowBenzerler] = useState(false);

  // Load API key and get DB stats
  useEffect(() => {
    const savedKey = localStorage.getItem('zift_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
    
    // Get total count from database
    supabase.from('sorular').select('id', { count: 'exact', head: true })
      .then(({ count }) => setDbStats({ count: count || 0 }));
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('zift_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setShowSettings(false);
  };

  // Benzer soruları bul
  const findSimilarQuestions = async (searchText) => {
    if (!searchText || searchText.length < 3) return [];
    
    // Anahtar kelimeler çıkar
    const keywords = searchText.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 5);
    
    if (keywords.length === 0) return [];
    
    // Basit ILIKE sorgusu ile benzer soruları bul
    let results = [];
    
    for (const keyword of keywords.slice(0, 3)) {
      const { data } = await supabase
        .from('sorular')
        .select('soru, cevap, urun_adi')
        .ilike('soru', `%${keyword}%`)
        .limit(5);
      
      if (data) {
        results = [...results, ...data];
      }
    }
    
    // Duplikasyonları kaldır
    const unique = results.filter((item, index, self) => 
      index === self.findIndex(t => t.soru === item.soru)
    );
    
    return unique.slice(0, 10);
  };

  const generateAnswer = async () => {
    if (!soru.trim()) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    
    setLoading(true);
    setCevap('');
    setBenzerler([]);
    setCopied(false);

    try {
      // 1. Önce veritabanından benzer soruları bul
      const similarQuestions = await findSimilarQuestions(soru);
      setBenzerler(similarQuestions);
      
      // 2. Benzer soru-cevapları prompt'a ekle
      let examplesText = '';
      if (similarQuestions.length > 0) {
        examplesText = '\n\n## BENZER SORULAR VE VERİLMİŞ CEVAPLAR (Bu tarzda cevap ver):\n';
        similarQuestions.slice(0, 5).forEach((q, i) => {
          examplesText += `\nÖrnek ${i + 1}:\nSoru: ${q.soru}\nCevap: ${q.cevap}\n`;
        });
      }

      // 3. Claude API'ye gönder
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
          system: `Sen Zift Unique markasının Trendyol müşteri hizmetleri asistanısın.

${ZIFT_KNOWLEDGE}
${examplesText}

KURALLAR:
1. Her zaman "Merhabalar" ile başla
2. Türkçe cevap ver
3. "efendim" kelimesini doğal şekilde kullan
4. Kısa, net ve yardımsever ol
5. Yukarıdaki benzer soru örneklerinin cevap tarzını TAKLİT ET
6. Sadece cevabı yaz, açıklama ekleme
7. Asla "yapay zeka" veya "asistan" olduğundan bahsetme`,
          messages: [
            {
              role: 'user',
              content: `${urunAdi ? `Ürün: ${urunAdi}\n` : ''}Müşteri Sorusu: ${soru}\n\nBu soruya Zift Unique tarzında kısa ve profesyonel bir cevap yaz.`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setCevap(`Hata: ${data.error.message}`);
        return;
      }
      
      const answer = data.content?.[0]?.text || 'Cevap oluşturulamadı.';
      setCevap(answer);
    } catch (error) {
      setCevap('Hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cevap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateAnswer();
    }
  };

  const usePreviousAnswer = (item) => {
    setCevap(item.cevap);
    setShowBenzerler(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              🛁 Zift Unique Asistan
            </h1>
            <p className="text-slate-400 text-sm">
              Veritabanı: {dbStats.count.toLocaleString()} soru-cevap
            </p>
          </div>
          <button
            onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }}
            className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Ayarlar"
          >
            ⚙️
          </button>
        </div>

        {/* API Key Warning */}
        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">
              ⚠️ API anahtarı gerekli. <button onClick={() => setShowSettings(true)} className="underline font-medium">Ayarlar'dan</button> ekleyin.
            </p>
          </div>
        )}

        {/* Input Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">
          {/* Ürün Adı */}
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Ürün Adı <span className="text-slate-500">(opsiyonel)</span>
            </label>
            <input
              type="text"
              value={urunAdi}
              onChange={(e) => setUrunAdi(e.target.value)}
              placeholder="Örn: Paslanmaz Çelik Havluluk"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Müşteri Sorusu */}
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Müşteri Sorusu <span className="text-red-400">*</span>
            </label>
            <textarea
              value={soru}
              onChange={(e) => setSoru(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Müşterinin sorusunu buraya yapıştırın..."
              rows={3}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateAnswer}
            disabled={loading || !soru.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
              loading || !soru.trim()
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cevap Üretiliyor...
              </span>
            ) : (
              '✨ Cevap Üret'
            )}
          </button>
        </div>

        {/* Answer Card */}
        {cevap && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 animate-fade-in mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">📝 Önerilen Cevap</h2>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                {copied ? '✓ Kopyalandı!' : '📋 Kopyala'}
              </button>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {cevap}
              </p>
            </div>
          </div>
        )}

        {/* Benzer Sorular */}
        {benzerler.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <button
              onClick={() => setShowBenzerler(!showBenzerler)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-semibold text-white">
                🔍 Benzer Sorular ({benzerler.length})
              </h2>
              <span className="text-slate-400">{showBenzerler ? '▲' : '▼'}</span>
            </button>
            
            {showBenzerler && (
              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {benzerler.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => usePreviousAnswer(item)}
                    className="w-full text-left bg-slate-700/50 hover:bg-slate-700 rounded-xl p-4 transition-colors"
                  >
                    <p className="text-white text-sm font-medium mb-1">{item.soru}</p>
                    <p className="text-slate-400 text-xs line-clamp-2">{item.cevap}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Tip */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            💡 Enter ile hızlı gönderim • Veritabanından benzer soruları bulur
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ Ayarlar</h3>
            
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Anthropic API Anahtarı
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-slate-500 text-xs mt-2">
                API anahtarınız tarayıcınızda güvenle saklanır.
                <a href="https://platform.claude.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-1 hover:underline">
                  Anahtar al →
                </a>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={saveApiKey}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
