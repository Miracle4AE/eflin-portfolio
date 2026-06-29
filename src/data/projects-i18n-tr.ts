export type ProjectLocaleContent = {
  title: string;
  category: string;
  role: string;
  client: string;
  summary: string;
  description: string;
  concept: string;
  challenge: string;
  solution: string;
  visualDirection: string;
  typography: string;
  tags: string[];
  imageAlt: string;
  paletteNames: string[];
  gallery: Record<string, { caption: string; alt: string }>;
};

export const projectTranslationsTr: Record<string, ProjectLocaleContent> = {
  nocturne: {
    title: "Nocturne",
    category: "Marka Kimliği",
    role: "Baş Tasarımcı",
    client: "Nocturne Parfums · Paris",
    summary:
      "Bağımsız bir parfüm evi için kimlik — sakin tipografi, koyu yüzeyler ve ürünün önce konuşmasına izin veren bir sistem.",
    description:
      "Bağımsız bir parfüm evi için kimlik — sakin tipografi, koyu yüzeyler ve ürünün önce konuşmasına izin veren bir sistem.",
    concept:
      "Nocturne, markayı saklananla kurar. İşaret minimal; palet neredeyse siyah; metin seyrek. Amaç, kokunun ten üzerinde oturmadan hemen önceki o anı hissettiren bir kimlik yaratmaktı.",
    challenge:
      "Müşteri kitlesi seçkin perakende ve özel randevular üzerinden alışveriş yapıyor — kitlesel e-ticaret değil. Kimliğin tezgah ölçeğinde düşünülmüş, basında kendinden emin; kategorinin tipik görsel gürültüsünden uzak hissettirmesi gerekiyordu.",
    solution:
      "Geniş aralıklı bir wordmark ve kutular, antetli kağıt ile dijital mecralarda kullanılan tek bir vurgu çizgisi geliştirdik. Fotoğraf yönetimi, ürün hero çekimlerinden çok gölgeyi tercih ediyor. Kısıtlama noktaydı; kılavuz on iki sayfaya sığıyor.",
    visualDirection:
      "Neredeyse monokrom. Yumuşak kontrast. Sıcaklığı yalnızca cam, mat kağıt ve ten tonları taşıyor. Süs yok.",
    typography:
      "Didot, ürün adları ve kampanya satırları için. Suisse Int'l, teknik bilgiler, yasal metinler ve arayüz için. Serif arzu taşır; sans gerçeği.",
    tags: ["Marka Kimliği", "Ambalaj", "Sanat Yönetimi"],
    imageAlt:
      "Nocturne Parfums marka kimliği — logotype, ambalaj ve kırtasiye",
    paletteNames: ["Boşluk", "Mürekkep", "Duman", "Ten", "Pirinç"],
    gallery: {
      n1: {
        caption: "Logotype ve birincil işaret",
        alt: "Siyah ambalaj üzerinde Nocturne Parfums wordmark",
      },
      n2: {
        caption: "Karton ve şişe etiketi",
        alt: "Nocturne parfüm ambalaj detayı",
      },
      n3: {
        caption: "Kırtasiye seti",
        alt: "Nocturne antetli kağıt ve kartvizitler",
      },
      n4: {
        caption: "Kampanya still life",
        alt: "Nocturne sanat yönetimli ürün fotoğrafçılığı",
      },
    },
  },

  meridian: {
    title: "Meridian",
    category: "Editoryal Tasarım",
    role: "Editoryal Tasarımcı",
    client: "Meridian Press · London",
    summary:
      "Bir sanat kitabı serisi için tasarım sistemi — cilt başına 200+ sayfaya dayanacak ızgara, ritim ve tipografik hiyerarşi.",
    description:
      "Bir sanat kitabı serisi için tasarım sistemi — cilt başına 200+ sayfaya dayanacak ızgara, ritim ve tipografik hiyerarşi.",
    concept:
      "Meridian, her kitabı bir oda dizisi olarak ele alır. Kenar boşlukları cömert; görseller nefes alır; metin yalnızca bağlam kattığında devreye girer. Seri rafta tutarlı, her kapak altında kendine özgü hissettirmeli.",
    challenge:
      "Yılda üç başlık, farklı sanatçılar, farklı kağıt türleri, tek matbaa. Sistem; değişken görsel oranları ve makale uzunluklarını her seferinde sıfırdan tasarım yapmadan karşılamalıydı.",
    solution:
      "Sabit tipografik roller taşıyan modüler bir ızgara: display, gövde, açıklama, kolofon. Bölüm açılışlarında tekrarlayan motif olarak tek bir yatay çizgi. Renk siyah, sıcak gri ve sanatçıya göre seçilen tek bir vurgu ile sınırlı.",
    visualDirection:
      "Fotoğraf için alan bırakan İsviçre disiplini. Kuşe olmayan kağıt. Tam sayfa metin yok. Açıklamalar her zaman görsellerden ayrı.",
    typography:
      "Neue Haas Grotesk Display, başlıklar için. Lyon Text, makaleler için 10/15. Letter Gothic, metadata ve künye bilgileri için.",
    tags: ["Editoryal", "Tipografi", "Baskı"],
    imageAlt: "Meridian Press editoryal tasarım — sanat kitabı serisi",
    paletteNames: ["Siyah", "Sıcak Gri", "Kağıt", "Çizgi", "Beyaz"],
    gallery: {
      m1: {
        caption: "Seri kapak ızgarası",
        alt: "Meridian Press sanat kitabı serisi kapakları",
      },
      m2: {
        caption: "İç sayfa açılımı",
        alt: "Meridian kitap içi fotoğraf açılımı",
      },
      m3: {
        caption: "Tipografik bölüm açılışı",
        alt: "Meridian editoryal tipografi yerleşimi",
      },
    },
  },

  solstice: {
    title: "Solstice",
    category: "Görsel Kimlik",
    role: "Kimlik Tasarımcısı",
    client: "Solstice Pavilion · Oslo",
    summary:
      "Çağdaş bir sergi programı için mevsimsel kimlik — tek yapı, değişen palet, yılda on iki sergi.",
    description:
      "Çağdaş bir sergi programı için mevsimsel kimlik — tek yapı, değişen palet, yılda on iki sergi.",
    concept:
      "Solstice, zamanı renk sıcaklığıyla işaretler. Yaz baskıları sıcak tonlara yönelir; kış baskıları soğur — ama logotype, ızgara ve afiş formatı asla değişmez. Ziyaretçiler mevsimi yerleşimden değil, tondan okumayı öğrenir.",
    challenge:
      "Pavyon; performans, enstalasyon ve söyleşileri aynı çatı altında programlıyor. Tabelalar, biletler ve sosyal medya varlıkları haftalık güncellenmeli; yine de doğaçlama görünmemeliydi.",
    solution:
      "Sabit bir afiş mimarisi kurduk: başlık üstte, tarih bloğu altta, mevsimi gösteren vurgu bandı. Dijital şablonlar punto boyutlarını kilitler; yalnızca bant rengi ve hero görseli değişir. Yönlendirme, duvarlarda aynı bant sistemini kullanır.",
    visualDirection:
      "Mevsimsel sıcaklık taşıyan kurumsal netlik. Büyük tipografi, küçük metadata. Fotoğraflar sert kırpılır; asla dekoratif değil.",
    typography:
      "FK Grotesk, tüm operasyonel tipografi için. Sanatçı adı başlık olduğunda sergi başlıkları için Portrait.",
    tags: ["Kimlik", "Yönlendirme", "Baskı"],
    imageAlt: "Solstice Pavilion görsel kimlik — afişler ve tabelalar",
    paletteNames: ["Kış", "İlkbahar", "Yaz", "Sonbahar", "Kağıt"],
    gallery: {
      s1: {
        caption: "Afiş sistemi — dört mevsim",
        alt: "Solstice Pavilion mevsimsel afiş serisi",
      },
      s2: {
        caption: "Sergi duyurusu",
        alt: "Solstice Pavilion sergi afişi",
      },
      s3: {
        caption: "Yönlendirme bant detayı",
        alt: "Solstice Pavilion çevresel grafikler",
      },
      s4: {
        caption: "Program kitapçığı",
        alt: "Solstice Pavilion basılı program",
      },
    },
  },

  atlas: {
    title: "Atlas",
    category: "Sanat Yönetimi",
    role: "Sanat Yönetmeni",
    client: "Atlas Journal · Remote / Field",
    summary:
      "Bir seyahat yayını için sanat yönetimi — haritacı düşünce, saha fotoğrafçılığı ve sayfada mesafeyi taşıyan yerleşimler.",
    description:
      "Bir seyahat yayını için sanat yönetimi — haritacı düşünce, saha fotoğrafçılığı ve sayfada mesafeyi taşıyan yerleşimler.",
    concept:
      "Atlas, yolculukları simge yapılar değil çizgilerle haritalar. Rotalar sayfa açılımlarını keser; açıklamalar koordinat gibi durur; boş alan kat edilen mesafeyi fısıldar. Okuyucu yerler arasındaki boşluğu hissetmeli.",
    challenge:
      "Katkıda bulunanlar altı kıtada farklı formatlarda çekim yapıyor. Sanat yönetimi; telefon görüntüleri, 35mm taramalar ve orta format çalışmaları aşırı rötuş yapmadan birleştirmeliydi.",
    solution:
      "Soluk bir renk derecelendirmesi ve tutarlı kenar boşluğu işlemi farklı kaynakları bir araya getirir. Ofis içi çizilen haritalar bölüm ayırıcıları olur. Alıntılar tek boyut ve konumda — değişken içerik boyunca görsel bir sabitleyici.",
    visualDirection:
      "Belgesel ton. Soluk renk. Haritalar dekor değil, grafik öğe. Tipografi küçük ve keskin; görseller büyük.",
    typography:
      "Graphik, navigasyon ve açıklamalar için. Tiempos Headline, öne çıkan başlıklar için. Koordinatlar ve sayfa metadata'sı için monospace.",
    tags: ["Sanat Yönetimi", "Editoryal", "Fotoğrafçılık"],
    imageAlt: "Atlas Journal sanat yönetimi — editoryal açılımlar ve haritalar",
    paletteNames: ["Okyanus", "Patika", "Kum", "Kağıt", "Rota"],
    gallery: {
      a1: {
        caption: "Rota haritalı öne çıkan açılım",
        alt: "Haritalı Atlas Journal editoryal açılımı",
      },
      a2: {
        caption: "Kapak uygulaması",
        alt: "Atlas Journal dergi kapağı",
      },
      a3: {
        caption: "Saha fotoğrafçılığı ızgarası",
        alt: "Atlas Journal fotoğraf essay yerleşimi",
      },
    },
  },

  verdant: {
    title: "Verdant",
    category: "Ambalaj ve İllüstrasyon",
    role: "İllüstratör ve Tasarımcı",
    client: "Verdant Apothecary · Portland",
    summary:
      "Küçük partili bir eczanede botanik illüstrasyon ve ambalaj — spesimenden çizildi, kuşe olmayan kağıda basıldı.",
    description:
      "Küçük partili bir eczanede botanik illüstrasyon ve ambalaj — spesimenden çizildi, kuşe olmayan kağıda basıldı.",
    concept:
      "Her ürün hattı, kurutulmuş numunelerden gerçek boyutta çizilen tek bir bitkiye bağlı. İllüstrasyon dekor değil belgeleme — etiket, metni okumadan önce içinde ne olduğunu söyler.",
    challenge:
      "Raf alanı sınırlı; etiketler kol mesafesinde okunmalı. 60 mm genişliğindeki bir tüpte düzenleyici metin, marka ifadesiyle yarışıyor.",
    solution:
      "Hiyerarşi katı: bitki adı en büyük, illüstrasyon ortada, içerik en küçük. Yalnızca iki yeşil ve krem — üçüncü vurgu yok. Tüpler ve kutular aynı şablonu paylaşır; yalnızca illüstrasyon değişir.",
    visualDirection:
      "Eczane sessizliği. Görünür kağıt dokusu. Dolgu yok, mürekkep çizgisi. Fotoğraf yalnızca içerik still life'larıyla sınırlı.",
    typography:
      "Satisfy, ürün adları için — el yazısı klişesi olmadan el hissi. IBM Plex Sans, içerik listesi ve barkodlar için.",
    tags: ["İllüstrasyon", "Ambalaj", "Baskı"],
    imageAlt: "Verdant Apothecary illüstrasyon ve ambalaj sistemi",
    paletteNames: ["Koyu Yeşil", "Yaprak", "Sis", "Krem", "Mürekkep"],
    gallery: {
      v1: {
        caption: "Orijinal botanik çizimler",
        alt: "Verdant Apothecary botanik illüstrasyon serisi",
      },
      v2: {
        caption: "Ambalaj ailesi",
        alt: "Verdant ürün ambalaj serisi",
      },
      v3: {
        caption: "Tüp etiket detayı",
        alt: "Verdant tüp etiket tipografi yakın plan",
      },
    },
  },

  echo: {
    title: "Echo",
    category: "Dijital Tasarım",
    role: "Dijital Tasarımcı",
    client: "Echo Platform · Berlin",
    summary:
      "Kültürel bir yayın platformu için interaktif kimlik — hareket mantığı, duyarlı işaret ve mobilde sinemaya ölçeklenen bir arayüz dili.",
    description:
      "Kültürel bir yayın platformu için interaktif kimlik — hareket mantığı, duyarlı işaret ve mobilde sinemaya ölçeklenen bir arayüz dili.",
    concept:
      "Echo'nun işareti sese yanıt verir — dijital bağlamlarda ses genliğiyle genişler ve daralır, baskıda statiktir. Fikir: dinleyen bir kimlik. Arayüz bileşenleri aynı nabız mantığını mikro etkileşim ölçeğinde devralır.",
    challenge:
      "Platform tiyatro, dans ve sanatçı söyleşilerini bir araya getiriyor. Kategoriler ton olarak farklı; arayüz ne Netflix ne de bir müze sitesi gibi hissettiremezdi — üçüncü bir register gerekiyordu.",
    solution:
      "Üç yerleşim modu tanımladık: performans (tam sayfa video), sohbet (bölünmüş metin/video) ve arşiv (ızgara). İşaret animasyonu yalnızca hover ve yüklemede çalışır — asla dikkat dağıtıcı döngüde değil. Karanlık mod varsayılan; kurumsal ortaklar için açık mod.",
    visualDirection:
      "Karanlık arayüz, yumuşak beyaz tipografi, tek mor vurgu. Küçük resimler 3:2 kırpılır. Hareket her yerde 400 ms altında.",
    typography:
      "Inter, arayüz için. Instrument Serif, program başlıkları ve sanatçı adları için. Süre metadata'sı için tabular figures.",
    tags: ["Dijital", "Hareket", "Kimlik"],
    imageAlt: "Echo Platform interaktif kimlik ve arayüz tasarımı",
    paletteNames: ["Arka Plan", "Yüzey", "Mor", "Metin", "Soluk"],
    gallery: {
      e1: {
        caption: "Ana ekran — performans modu",
        alt: "Echo Platform dijital arayüz ana ekranı",
      },
      e2: {
        caption: "Duyarlı işaret davranışı",
        alt: "Echo Platform animasyonlu logo durumları",
      },
      e3: {
        caption: "Mobil program görünümü",
        alt: "Echo Platform mobil uygulama ekranları",
      },
    },
  },
};
