import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const supabase = createClient(
  'https://xnzlzzxstnjohvflfyrn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhuemx6enhzdG5qb2h2ZmxmeXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjIzMDMsImV4cCI6MjA4NTUzODMwM30.rfkipXFe6PR8XWJ4iSwHOThJs5cL9sSjU8QsM1XUktc'
);

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
  
  // Düzeltme sistemi
  const [showDuzeltme, setShowDuzeltme] = useState(false);
  const [duzeltmeNotu, setDuzeltmeNotu] = useState('');
  const [duzeltmeLoading, setDuzeltmeLoading] = useState(false);
  const [duzeltilmisCevap, setDuzeltilmisCevap] = useState('');
  
  // Kurallar ve ürün bilgileri
  const [kurallar, setKurallar] = useState([]);
  const [urunBilgileri, setUrunBilgileri] = useState([]);

  // Load API key and get DB stats
  useEffect(() => {
    const savedKey = localStorage.getItem('zift_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
    
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
    const { data } = await supabase
      .from('urun_bilgileri')
      .select('urun_adi, bilgi_turu, bilgi');
    setUrunBilgileri(data || []);
  };

  const saveApiKey = () => {
    localStorage.setItem('zift_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setShowSettings(false);
  };

  // Benzer soruları bul (hem eski sorulardan hem onaylanan cevaplardan)
  const findSimilarQuestions = async (searchText) => {
    if (!searchText || searchText.length < 3) return [];
    
    const keywords = searchText.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 5);
    
    if (keywords.length === 0) return [];
    
    let results = [];
    
    // 1. Önce onaylanan_cevaplar tablosundan ara (en güncel)
    for (const keyword of keywords.slice(0, 2)) {
      const { data: onaylananData } = await supabase
        .from('onaylanan_cevaplar')
        .select('soru, dogru_cevap, urun_adi')
        .ilike('soru', `%${keyword}%`)
        .limit(5);
      
      if (onaylananData) {
        results = [...results, ...onaylananData.map(d => ({
          soru: d.soru,
          cevap: d.dogru_cevap,
          urun_adi: d.urun_adi,
          kaynak: 'onaylanan'
        }))];
      }
    }
    
    // 2. Sonra eski sorular tablosundan ara
    for (const keyword of keywords.slice(0, 3)) {
      const { data } = await supabase
        .from('sorular')
        .select('soru, cevap, urun_adi')
        .ilike('soru', `%${keyword}%`)
        .limit(5);
      
      if (data) {
        results = [...results, ...data.map(d => ({ ...d, kaynak: 'eski' }))];
      }
    }
    
    // Duplikasyonları kaldır, onaylananları önce göster
    const unique = results.filter((item, index, self) => 
      index === self.findIndex(t => t.soru === item.soru)
    );
    
    // Onaylananları öne al
    unique.sort((a, b) => {
      if (a.kaynak === 'onaylanan' && b.kaynak !== 'onaylanan') return -1;
      if (a.kaynak !== 'onaylanan' && b.kaynak === 'onaylanan') return 1;
      return 0;
    });
    
    return unique.slice(0, 10);
  };

  // Ürüne özel bilgileri bul
  const getUrunBilgileri = (urunAdi) => {
    if (!urunAdi) return [];
    
    const bilgiler = urunBilgileri.filter(u => 
      urunAdi.toLowerCase().includes(u.urun_adi.toLowerCase()) ||
      u.urun_adi.toLowerCase().includes(urunAdi.toLowerCase()) ||
      u.urun_adi === 'GENEL'
    );
    
    return bilgiler;
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
    setShowDuzeltme(false);
    setDuzeltilmisCevap('');
    setDuzeltmeNotu('');

    try {
      // 1. Benzer soruları bul
      const similarQuestions = await findSimilarQuestions(soru);
      setBenzerler(similarQuestions);
      
      // 2. Ürün bilgilerini al
      const urunBilgi = getUrunBilgileri(urunAdi);
      
      // 3. Kuralları hazırla
      const kurallarText = kurallar.map((k, i) => `${i + 1}. ${k.kural}`).join('\n');
      
      // 4. Benzer soru-cevapları hazırla
      let examplesText = '';
      if (similarQuestions.length > 0) {
        examplesText = '\n\n## BENZER SORULAR VE CEVAPLAR (Bu tarzda cevap ver, öncelik onaylananlarda):\n';
        similarQuestions.slice(0, 5).forEach((q, i) => {
          const onayTag = q.kaynak === 'onaylanan' ? ' [ONAYLANMIŞ - BU TARZI KULLAN]' : '';
          examplesText += `\nÖrnek ${i + 1}${onayTag}:\nSoru: ${q.soru}\nCevap: ${q.cevap}\n`;
        });
      }
      
      // 5. Ürün bilgilerini hazırla
      let urunText = '';
      if (urunBilgi.length > 0) {
        urunText = '\n\n## BU ÜRÜN HAKKINDA BİLGİLER:\n';
        urunBilgi.forEach(u => {
          urunText += `- ${u.urun_adi} (${u.bilgi_turu}): ${u.bilgi}\n`;
        });
      }

      // 6. Claude API'ye gönder
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
          system: `Sen Zift Unique markasının Trendyol müşteri hizmetleri asistanısın. Banyo aksesuarları ve paslanmaz çelik ürünler satıyorsun.

## KESİN UYULMASI GEREKEN KURALLAR:
${kurallarText}
${urunText}
${examplesText}

## GENEL HATILATMALAR:
- Her zaman "Merhabalar" ile başla
- Türkçe cevap ver
- Cevap başına sadece 1 kere "efendim" kullan
- Kısa, net ve yardımsever ol
- [ONAYLANMIŞ] işaretli örneklerin tarzını öncelikli olarak taklit et
- Sadece cevabı yaz, açıklama ekleme
- Asla "yapay zeka" veya "asistan" olduğundan bahsetme
- Soruda birden fazla konu varsa hepsine cevap ver`,
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

  // Düzeltme fonksiyonu
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
          system: `Sen Zift Unique müşteri hizmetleri asistanısın. 
Sana bir müşteri sorusu, yanlış cevap ve düzeltme notu verilecek.
Düzeltme notuna göre yeni bir cevap üret.
Düzeltme notu bozuk Türkçe ile yazılmış olabilir, sen düzgün Türkçe ile cevap yaz.
Her zaman "Merhabalar" ile başla, sadece 1 kere "efendim" kullan.
Sadece cevabı yaz, açıklama ekleme.`,
          messages: [
            {
              role: 'user',
              content: `Müşteri Sorusu: ${soru}

Yanlış Cevap: ${cevap}

Düzeltme Notu: ${duzeltmeNotu}

Bu düzeltme notuna göre yeni doğru cevabı yaz.`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        alert('Hata: ' + data.error.message);
        return;
      }
      
      const newAnswer = data.content?.[0]?.text || '';
      setDuzeltilmisCevap(newAnswer);
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setDuzeltmeLoading(false);
    }
  };

  // Düzeltilmiş cevabı onayla ve kaydet
  const handleOnayla = async () => {
    try {
      await supabase.from('onaylanan_cevaplar').insert({
        soru: soru,
        urun_adi: urunAdi || null,
        yanlis_cevap: cevap,
        dogru_cevap: duzeltilmisCevap,
        duzeltme_notu: duzeltmeNotu
      });
      
      setCevap(duzeltilmisCevap);
      setShowDuzeltme(false);
      setDuzeltilmisCevap('');
      setDuzeltmeNotu('');
      loadDbStats(); // Stats güncelle
      
      // Kopyala
      navigator.clipboard.writeText(duzeltilmisCevap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Kaydetme hatası: ' + error.message);
    }
  };

  const copyToClipboard = async () => {
    navigator.clipboard.writeText(cevap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Opsiyonel: İyi cevabı da kaydet (sessizce)
    // Bu sayede iyi örnekler de birikir
    try {
      await supabase.from('onaylanan_cevaplar').insert({
        soru: soru,
        urun_adi: urunAdi || null,
        yanlis_cevap: null,
        dogru_cevap: cevap,
        duzeltme_notu: 'Direkt onaylandı'
      });
      loadDbStats();
    } catch (e) {
      // Sessizce geç
    }
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              🛁 Zift Unique Asistan
            </h1>
            <p className="text-slate-400 text-xs">
              📚 {dbStats.sorular.toLocaleString()} soru • 📋 {dbStats.kurallar} kural • ✅ {dbStats.onaylanan} öğrenilmiş
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
        {cevap && !showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 animate-fade-in mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">📝 Önerilen Cevap</h2>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-4">
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {cevap}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {copied ? '✓ Kopyalandı!' : '✓ Kopyala'}
              </button>
              <button
                onClick={() => setShowDuzeltme(true)}
                className="flex-1 py-3 rounded-xl font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                ❌ Yanlış
              </button>
            </div>
          </div>
        )}

        {/* Düzeltme Paneli */}
        {showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-orange-500/30 animate-fade-in mb-6">
            <h2 className="text-lg font-semibold text-orange-400 mb-4">🔧 Düzeltme</h2>
            
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700 mb-4">
              <p className="text-slate-400 text-sm mb-1">Yanlış Cevap:</p>
              <p className="text-slate-300 text-sm">{cevap}</p>
            </div>

            {!duzeltilmisCevap ? (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Ne yanlış? <span className="text-slate-500">(kısa not yeterli, bozuk Türkçe de olur)</span>
                  </label>
                  <textarea
                    value={duzeltmeNotu}
                    onChange={(e) => setDuzeltmeNotu(e.target.value)}
                    placeholder="Örn: 3 adet geliyo 1 deil, hediye yok dememiz lazım..."
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDuzeltme(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDuzelt}
                    disabled={duzeltmeLoading || !duzeltmeNotu.trim()}
                    className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${
                      duzeltmeLoading || !duzeltmeNotu.trim()
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500'
                    }`}
                  >
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
                  <button
                    onClick={() => {
                      setDuzeltilmisCevap('');
                      setDuzeltmeNotu('');
                    }}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    Hala Yanlış
                  </button>
                  <button
                    onClick={handleOnayla}
                    className="flex-1 py-3 rounded-xl font-medium text-white bg-green-600 hover:bg-green-500 transition-colors"
                  >
                    ✓ Tamam, Kaydet
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Benzer Sorular */}
        {benzerler.length > 0 && !showDuzeltme && (
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
                    className={`w-full text-left rounded-xl p-4 transition-colors ${
                      item.kaynak === 'onaylanan' 
                        ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30' 
                        : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    {item.kaynak === 'onaylanan' && (
                      <span className="text-green-400 text-xs mb-1 block">✓ Öğrenilmiş</span>
                    )}
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
            💡 Kopyala = öğrenir • Yanlış = düzeltip öğretirsin
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
                <a href="https://platform.claude.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  platform.claude.com
                </a> adresinden API anahtarı alın.
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
