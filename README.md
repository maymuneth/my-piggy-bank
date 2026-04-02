# 🐷 My Piggy Bank

Dijital kumbaran. Hedef koy, para kilitle, APY kazan.

Built with **Starkzap SDK** on **Starknet Mainnet**.

---

## ✨ Özellikler

- 🎯 **Hedef bazlı birikim** — Ev, Araba, Tatil, Eğitim ve daha fazlası
- 🔒 **Zaman kilidi** — Para süre dolmadan çekilemiyor
- ⚡ **STRK Native Staking** — Kilitli para APY kazanıyor (~%10-15)
- 💵 **USDC desteği** — Stabil birikim (Vesu lending yakında)
- 👶 **Kids Mode** — Çocuk sadece görür, ebeveyn kilidi açar
- 🪄 **Gasless işlemler** — AVNU Paymaster ile gas ücreti yok
- 📧 **Email / Sosyal giriş** — Privy ile seed phrase gerekmez
- 🔑 **ArgentX / Braavos** — Mevcut cüzdanla direkt bağlan

---

## 🚀 Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:

| Değişken | Nereden alınır |
|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | [dashboard.privy.io](https://dashboard.privy.io) |
| `PRIVY_APP_SECRET` | [dashboard.privy.io](https://dashboard.privy.io) |
| `NEXT_PUBLIC_AVNU_API_KEY` | [app.avnu.fi/en/paymaster](https://app.avnu.fi/en/paymaster) |
| `NEXT_PUBLIC_STARKNET_RPC` | [alchemy.com](https://alchemy.com) (opsiyonel) |

### 3. Geliştirme sunucusunu başlat

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresine git.

---

## 🏗️ Proje Yapısı

```
my-piggy-bank/
├── app/
│   ├── page.tsx                    ← Giriş / Wallet bağlantı
│   ├── dashboard/page.tsx          ← Tüm kumbaralar
│   ├── create/page.tsx             ← Yeni kumbara oluştur (3 adım)
│   ├── withdraw/[id]/page.tsx      ← Kumbara detay & çekme
│   └── api/
│       └── wallet/
│           ├── starknet/route.ts   ← Privy wallet oluşturma
│           └── sign/route.ts       ← Privy tx imzalama
├── components/
│   ├── ConnectWallet.tsx           ← Privy + Private Key giriş ekranı
│   ├── WalletContext.tsx           ← Global wallet state
│   └── PiggyCard.tsx               ← Kumbara kartı
├── lib/
│   ├── starkzap.ts                 ← SDK init (mainnet)
│   ├── wallet.ts                   ← Bağlantı fonksiyonları
│   ├── piggybank.ts                ← STRK staking + deposit + withdraw
│   └── constants.ts                ← Token adresleri, hedefler
└── types/index.ts                  ← TypeScript tipleri
```

---

## 🔧 Starkzap SDK Kullanımı

### Wallet Bağlantısı

```ts
// Privy (Web2 kullanıcılar)
const wallet = await connectWithPrivy(accessToken);

// Private Key (ArgentX, Braavos)
const wallet = await connectWithPrivateKey(privateKey, "argentv050");
```

### STRK Staking (APY)

```ts
// Para yatır → otomatik stake → APY kazan
const tx = await wallet.stake(poolAddress, Amount.parse("100", STRK));
await tx.wait();

// APY topla
const tx = await wallet.claimPoolRewards(poolAddress);
await tx.wait();

// Para çek (kilit dolunca)
const tx = await wallet.exitPoolIntent(poolAddress, amount);
await tx.wait();
```

### Bakiye

```ts
const balance = await wallet.getBalance(TOKENS.STRK.address);
console.log(balance.toFormatted()); // "1,234.56 STRK"
```

---

## 📦 Kullanılan Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| [Starkzap SDK](https://docs.starknet.io/build/starkzap) | Starknet entegrasyonu, staking, gasless tx |
| [Privy](https://privy.io) | Email/sosyal wallet yönetimi |
| [AVNU Paymaster](https://avnu.fi) | Gasless işlemler |
| Next.js 15 | Frontend framework |
| TypeScript | Tip güvenliği |

---

## 🗺️ Yol Haritası

- [x] STRK native staking
- [x] Privy + Private Key wallet
- [x] Kids Mode
- [x] Zaman kilidi & countdown
- [ ] USDC → Vesu lending APY
- [ ] Push bildirimleri (kilit açıldığında)
- [ ] Toplu para yatırma (DCA)
- [ ] Mobile app (React Native)

---

Built for the **Starkzap Developer Challenge** — April 2026 🏆
