import { useState } from 'react';
import { supabase } from './supabaseClient';
import { VARSAYILAN_ESLESTIRME } from './constants';

const TABS = [
  { id: 'kurallar', label: '📋 Kurallar' },
  { id: 'urunbilgi', label: '📦 Ürün Bilgileri' },
  { id: 'eslestirme', label: '🔗 Eşleştirmeler' },
  { id: 'temizlik', label: '🧹 Temizlik & İstatistik' },
];

export default function YonetimPaneli({ onClose, kurallar, loadKurallar, urunBilgileri, loadUrunBilgileri, eslestirme, eslestirmeKaydet, dbStats, loadDbStats }) {
  const [tab, setTab] = useState('kurallar');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl border border-slate-700 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-lg font-bold text-white">🛠️ Yönetim Paneli</h3>
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 bg-slate-700 rounded-lg hover:bg-slate-600">✕ Kapat</button>
        </div>

        <div className="flex gap-1 p-3 border-b border-slate-700 flex-shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'kurallar' && <KurallarTab kurallar={kurallar} loadKurallar={loadKurallar} />}
          {tab === 'urunbilgi' && <UrunBilgiTab urunBilgileri={urunBilgileri} loadUrunBilgileri={loadUrunBilgileri} />}
          {tab === 'eslestirme' && <EslestirmeTab eslestirme={eslestirme} eslestirmeKaydet={eslestirmeKaydet} />}
          {tab === 'temizlik' && <TemizlikTab dbStats={dbStats} loadDbStats={loadDbStats} />}
        </div>
      </div>
    </div>
  );
}

/* ─── KURALLAR TAB ─── */
function KurallarTab({ kurallar, loadKurallar }) {
  const [yeniKural, setYeniKural] = useState('');
  const [yeniOncelik, setYeniOncelik] = useState(80);
  const [duzenleId, setDuzenleId] = useState(null);
  const [duzenleText, setDuzenleText] = useState('');
  const [saving, setSaving] = useState(false);

  const kuralEkle = async () => {
    if (!yeniKural.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('kurallar').insert({ kural: yeniKural.trim(), oncelik: yeniOncelik, aktif: true });
    if (error) { alert('Hata: ' + error.message); }
    else { setYeniKural(''); setYeniOncelik(80); await loadKurallar(); }
    setSaving(false);
  };

  const kuralGuncelle = async (id) => {
    if (!duzenleText.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('kurallar').update({ kural: duzenleText.trim() }).eq('id', id);
    if (error) alert('Hata: ' + error.message);
    else { setDuzenleId(null); setDuzenleText(''); await loadKurallar(); }
    setSaving(false);
  };

  const kuralToggle = async (id, aktif) => {
    await supabase.from('kurallar').update({ aktif: !aktif }).eq('id', id);
    await loadKurallar();
  };

  const kuralSil = async (id) => {
    if (!confirm('Bu kuralı silmek istediğinize emin misiniz?')) return;
    await supabase.from('kurallar').delete().eq('id', id);
    await loadKurallar();
  };

  return (
    <div>
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
        <label className="text-sm text-slate-300 font-medium block mb-2">Yeni Kural Ekle</label>
        <textarea value={yeniKural} onChange={e => setYeniKural(e.target.value)} rows={2} placeholder="Örn: Müşteriye asla 'bilmiyorum' deme..."
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 resize-none mb-2" />
        <div className="flex gap-2 items-center">
          <label className="text-xs text-slate-500">Öncelik:</label>
          <input type="number" value={yeniOncelik} onChange={e => setYeniOncelik(Number(e.target.value))} min={1} max={100}
            className="w-16 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm outline-none" />
          <span className="text-xs text-slate-500">(100=en yüksek)</span>
          <button onClick={kuralEkle} disabled={saving || !yeniKural.trim()}
            className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed">
            {saving ? '...' : '+ Ekle'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {kurallar.map(k => (
          <div key={k.id} className={`rounded-lg p-3 border transition-all ${k.aktif ? 'bg-slate-900/30 border-slate-700' : 'bg-slate-900/10 border-slate-800 opacity-50'}`}>
            {duzenleId === k.id ? (
              <div>
                <textarea value={duzenleText} onChange={e => setDuzenleText(e.target.value)} rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none mb-2 resize-none" />
                <div className="flex gap-2">
                  <button onClick={() => setDuzenleId(null)} className="px-3 py-1 text-xs text-slate-400 bg-slate-700 rounded-lg">İptal</button>
                  <button onClick={() => kuralGuncelle(k.id)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-lg">Kaydet</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-xs text-slate-500 font-mono mt-0.5 flex-shrink-0">#{k.oncelik}</span>
                <p className="text-sm text-slate-200 flex-1">{k.kural}</p>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => kuralToggle(k.id, k.aktif)} className={`px-2 py-1 text-xs rounded-lg ${k.aktif ? 'text-green-400 bg-green-500/10' : 'text-slate-500 bg-slate-700'}`}>
                    {k.aktif ? 'Aktif' : 'Pasif'}
                  </button>
                  <button onClick={() => { setDuzenleId(k.id); setDuzenleText(k.kural); }} className="px-2 py-1 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg">✏️</button>
                  <button onClick={() => kuralSil(k.id)} className="px-2 py-1 text-xs text-red-400 bg-red-500/10 rounded-lg">🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ÜRÜN BİLGİ TAB ─── */
function UrunBilgiTab({ urunBilgileri, loadUrunBilgileri }) {
  const [form, setForm] = useState({ urun_adi: '', bilgi_turu: 'bilgi', bilgi: '' });
  const [duzenleId, setDuzenleId] = useState(null);
  const [saving, setSaving] = useState(false);

  const bilgiEkle = async () => {
    if (!form.urun_adi.trim() || !form.bilgi.trim()) return;
    setSaving(true);
    if (duzenleId) {
      const { error } = await supabase.from('urun_bilgileri').update(form).eq('id', duzenleId);
      if (error) alert('Hata: ' + error.message);
      else setDuzenleId(null);
    } else {
      const { error } = await supabase.from('urun_bilgileri').insert(form);
      if (error) alert('Hata: ' + error.message);
    }
    setForm({ urun_adi: '', bilgi_turu: 'bilgi', bilgi: '' });
    await loadUrunBilgileri();
    setSaving(false);
  };

  const bilgiSil = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await supabase.from('urun_bilgileri').delete().eq('id', id);
    await loadUrunBilgileri();
  };

  const bilgiDuzenle = (item) => {
    setDuzenleId(item.id);
    setForm({ urun_adi: item.urun_adi, bilgi_turu: item.bilgi_turu, bilgi: item.bilgi });
  };

  const gruplar = {};
  urunBilgileri.forEach(u => {
    if (!gruplar[u.urun_adi]) gruplar[u.urun_adi] = [];
    gruplar[u.urun_adi].push(u);
  });

  return (
    <div>
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
        <label className="text-sm text-slate-300 font-medium block mb-2">{duzenleId ? '✏️ Düzenle' : '+ Yeni Bilgi Ekle'}</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input value={form.urun_adi} onChange={e => setForm({ ...form, urun_adi: e.target.value })} placeholder="Ürün adı (veya GENEL)"
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
          <select value={form.bilgi_turu} onChange={e => setForm({ ...form, bilgi_turu: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
            {['bilgi', 'olcu', 'montaj', 'malzeme', 'garanti', 'uyumluluk', 'renk', 'adet', 'paket_icerigi', 'tasarim', 'kullanim', 'not', 'ozellik', 'satis', 'kapasite', 'icerik', 'gereksinim', 'sac_kalinlik', 'yapisma_yuzey', 'yapisma_talimat'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input value={form.bilgi} onChange={e => setForm({ ...form, bilgi: e.target.value })} placeholder="Bilgi içeriği"
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none" />
        </div>
        <div className="flex gap-2">
          {duzenleId && <button onClick={() => { setDuzenleId(null); setForm({ urun_adi: '', bilgi_turu: 'bilgi', bilgi: '' }); }} className="px-3 py-2 text-xs text-slate-400 bg-slate-700 rounded-lg">İptal</button>}
          <button onClick={bilgiEkle} disabled={saving || !form.urun_adi.trim() || !form.bilgi.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${duzenleId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'} disabled:bg-slate-600 disabled:cursor-not-allowed`}>
            {saving ? '...' : duzenleId ? '✏️ Güncelle' : '+ Ekle'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(gruplar).map(([urunAdi, bilgiler]) => (
          <div key={urunAdi} className="bg-slate-900/30 rounded-lg p-3 border border-slate-700">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">{urunAdi}</h4>
            {bilgiler.map(b => (
              <div key={b.id} className="flex items-center gap-2 py-1 text-xs">
                <span className="text-slate-500 w-24 flex-shrink-0">{b.bilgi_turu}</span>
                <span className="text-slate-300 flex-1">{b.bilgi}</span>
                <button onClick={() => bilgiDuzenle(b)} className="text-yellow-400 hover:text-yellow-300 p-1">✏️</button>
                <button onClick={() => bilgiSil(b.id)} className="text-red-400 hover:text-red-300 p-1">🗑️</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── EŞLEŞTİRME TAB ─── */
function EslestirmeTab({ eslestirme, eslestirmeKaydet }) {
  const [yeniUrun, setYeniUrun] = useState({ barkod: '', isim: '', model_kodu: '' });
  const [duzenleIndex, setDuzenleIndex] = useState(null);

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

  return (
    <div>
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4 grid grid-cols-3 gap-2 items-end">
        {[['Barkod', 'barkod'], ['İsim', 'isim'], ['Model Kodu', 'model_kodu']].map(([label, key]) => (
          <div key={key}>
            <label className="text-xs text-slate-500 block mb-1">{label}</label>
            <input value={yeniUrun[key]} onChange={e => setYeniUrun({ ...yeniUrun, [key]: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
          </div>
        ))}
        <div className="col-span-3 flex gap-2">
          <button onClick={urunEkle} disabled={!yeniUrun.barkod || !yeniUrun.isim || !yeniUrun.model_kodu}
            className={`flex-1 py-2 rounded-lg text-sm font-medium text-white ${duzenleIndex !== null ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'} disabled:bg-slate-600 disabled:cursor-not-allowed`}>
            {duzenleIndex !== null ? '✏️ Güncelle' : '+ Ekle'}
          </button>
          <button onClick={() => eslestirmeKaydet(VARSAYILAN_ESLESTIRME)} className="px-3 py-2 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10">Sıfırla</button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-2">{eslestirme.length} kayıt</p>
      <div className="max-h-72 overflow-y-auto space-y-1">
        {eslestirme.map((item, i) => (
          <div key={item.barkod} className={`grid grid-cols-4 gap-2 px-3 py-2 rounded-lg text-sm items-center ${duzenleIndex === i ? 'bg-orange-500/10' : i % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
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
  );
}

/* ─── TEMİZLİK & İSTATİSTİK TAB ─── */
function TemizlikTab({ dbStats, loadDbStats }) {
  const [temizlikSonuc, setTemizlikSonuc] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [detayliStats, setDetayliStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const duplicateTemizle = async () => {
    setCleaning(true);
    try {
      const { data, error } = await supabase.from('onaylanan_cevaplar').select('id, soru').order('created_at', { ascending: false });
      if (error) throw error;

      const seen = new Map();
      const toDelete = [];
      for (const row of data) {
        const key = row.soru?.trim().toLowerCase();
        if (!key) continue;
        if (seen.has(key)) {
          toDelete.push(row.id);
        } else {
          seen.set(key, row.id);
        }
      }

      if (toDelete.length > 0) {
        const { error: delError } = await supabase.from('onaylanan_cevaplar').delete().in('id', toDelete);
        if (delError) throw delError;
      }

      setTemizlikSonuc(`${toDelete.length} duplicate kayıt silindi.`);
      await loadDbStats();
    } catch (err) {
      setTemizlikSonuc('Hata: ' + err.message);
    }
    setCleaning(false);
  };

  const detayliIstatistik = async () => {
    setLoadingStats(true);
    try {
      const { data: onaylanan } = await supabase.from('onaylanan_cevaplar').select('duzeltme_notu, created_at');
      const dogrudan = onaylanan?.filter(r => r.duzeltme_notu === 'Doğrudan onaylandı' || r.duzeltme_notu === 'Doğrudan onaylandı (güncelleme)').length || 0;
      const duzeltme = (onaylanan?.length || 0) - dogrudan;

      const buHafta = onaylanan?.filter(r => {
        const d = new Date(r.created_at);
        const now = new Date();
        return (now - d) < 7 * 24 * 60 * 60 * 1000;
      }).length || 0;

      setDetayliStats({ toplam: onaylanan?.length || 0, dogrudan, duzeltme, buHafta });
    } catch {
      setDetayliStats(null);
    }
    setLoadingStats(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-3">📊 Genel Durum</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{dbStats.sorular.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Soru</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{dbStats.onaylanan}</p>
            <p className="text-xs text-slate-500">Öğrenilmiş</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{dbStats.kurallar}</p>
            <p className="text-xs text-slate-500">Kural</p>
          </div>
        </div>
        <button onClick={detayliIstatistik} disabled={loadingStats}
          className="mt-3 w-full py-2 rounded-lg text-xs text-slate-400 border border-slate-600 hover:bg-slate-700 transition-colors">
          {loadingStats ? 'Yükleniyor...' : '📈 Detaylı İstatistik'}
        </button>
        {detayliStats && (
          <div className="mt-3 bg-slate-800 rounded-lg p-3 text-xs space-y-1">
            <p className="text-slate-300">Toplam öğrenilmiş: <span className="text-white font-bold">{detayliStats.toplam}</span></p>
            <p className="text-green-400">Doğrudan onaylanan: <span className="font-bold">{detayliStats.dogrudan}</span></p>
            <p className="text-orange-400">Düzeltme sonrası: <span className="font-bold">{detayliStats.duzeltme}</span></p>
            <p className="text-blue-400">Bu hafta: <span className="font-bold">{detayliStats.buHafta}</span></p>
            {detayliStats.toplam > 0 && (
              <p className="text-slate-400 mt-2">Doğruluk oranı: <span className="text-white font-bold">{Math.round((detayliStats.dogrudan / detayliStats.toplam) * 100)}%</span></p>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-3">🧹 Duplicate Temizliği</h4>
        <p className="text-xs text-slate-400 mb-3">Onaylanan cevaplardaki tekrar eden soruları tespit edip en güncelini bırakarak diğerlerini siler.</p>
        <button onClick={duplicateTemizle} disabled={cleaning}
          className="w-full py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
          {cleaning ? '⏳ Temizleniyor...' : '🧹 Duplicateları Temizle'}
        </button>
        {temizlikSonuc && <p className="mt-2 text-xs text-green-400">{temizlikSonuc}</p>}
      </div>
    </div>
  );
}
