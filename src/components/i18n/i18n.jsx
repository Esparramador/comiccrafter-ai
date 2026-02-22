import React, { createContext, useContext, useState, useEffect } from "react";

export const LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ca", name: "Català", flag: "🏴" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦", rtl: true },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "nl", name: "Nederlands", flag: "🇧🇪" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

export const translations = {
  es: {
    nav: {
      home: "Inicio", create: "Crear Cómic", myComics: "Mis Cómics",
      characters: "Mis Personajes", covers: "Portadas IA", shorts: "Cortos IA", drafts: "Borradores"
    },
    hero: {
      badge: "Motor de IA Generativa para Cómics · Comic Crafter",
      title1: "Convierte tus",
      title2: "historias en cómics",
      title3: "con IA",
      subtitle: "Sube tus fotos, cuenta tu historia y deja que nuestra IA genere un cómic profesional con estilo anime, manga o el que prefieras. Páginas completas con paneles, diálogos y arte impresionante.",
      cta1: "Crear mi Cómic",
      cta2: "Ver mis Cómics",
      f1title: "Sube Fotos", f1desc: "Sube fotos reales y la IA creará personajes basados en ellas",
      f2title: "Cuenta tu Historia", f2desc: "Escribe la trama y la IA genera guion, diálogos y paneles",
      f3title: "Arte Profesional", f3desc: "Elige entre estilos manga, anime, noir, fantasía y más",
    }
  },
  en: {
    nav: {
      home: "Home", create: "Create Comic", myComics: "My Comics",
      characters: "My Characters", covers: "AI Covers", shorts: "AI Shorts", drafts: "Drafts"
    },
    hero: {
      badge: "Generative AI Engine for Comics · Comic Crafter",
      title1: "Turn your",
      title2: "stories into comics",
      title3: "with AI",
      subtitle: "Upload your photos, tell your story and let our AI generate a professional comic in anime, manga or any style you prefer. Full pages with panels, dialogues and stunning art.",
      cta1: "Create my Comic",
      cta2: "View my Comics",
      f1title: "Upload Photos", f1desc: "Upload real photos and AI will create characters based on them",
      f2title: "Tell your Story", f2desc: "Write the plot and AI generates script, dialogues and panels",
      f3title: "Professional Art", f3desc: "Choose from manga, anime, noir, fantasy styles and more",
    }
  },
  fr: {
    nav: {
      home: "Accueil", create: "Créer une BD", myComics: "Mes BD",
      characters: "Mes Personnages", covers: "Couvertures IA", shorts: "Courts IA", drafts: "Brouillons"
    },
    hero: {
      badge: "Moteur d'IA Générative pour BD · Comic Crafter",
      title1: "Transformez vos",
      title2: "histoires en BD",
      title3: "avec l'IA",
      subtitle: "Téléchargez vos photos, racontez votre histoire et laissez notre IA générer une bande dessinée professionnelle en style anime, manga ou celui que vous préférez.",
      cta1: "Créer ma BD",
      cta2: "Voir mes BD",
      f1title: "Télécharger des Photos", f1desc: "Téléchargez de vraies photos et l'IA créera des personnages basés sur elles",
      f2title: "Racontez votre Histoire", f2desc: "Écrivez l'intrigue et l'IA génère le script, les dialogues et les panneaux",
      f3title: "Art Professionnel", f3desc: "Choisissez parmi les styles manga, anime, noir, fantaisie et plus",
    }
  },
  de: {
    nav: {
      home: "Start", create: "Comic erstellen", myComics: "Meine Comics",
      characters: "Meine Figuren", covers: "KI-Cover", shorts: "KI-Shorts", drafts: "Entwürfe"
    },
    hero: {
      badge: "Generative KI-Engine für Comics · Comic Crafter",
      title1: "Verwandle deine",
      title2: "Geschichten in Comics",
      title3: "mit KI",
      subtitle: "Lade deine Fotos hoch, erzähle deine Geschichte und lass unsere KI einen professionellen Comic im Anime-, Manga- oder einem anderen Stil erstellen.",
      cta1: "Meinen Comic erstellen",
      cta2: "Meine Comics ansehen",
      f1title: "Fotos hochladen", f1desc: "Lade echte Fotos hoch und die KI erstellt darauf basierende Figuren",
      f2title: "Deine Geschichte erzählen", f2desc: "Schreibe die Handlung und die KI generiert Skript, Dialoge und Panels",
      f3title: "Professionelle Kunst", f3desc: "Wähle zwischen Manga-, Anime-, Noir-, Fantasy-Stilen und mehr",
    }
  },
  it: {
    nav: {
      home: "Home", create: "Crea Fumetto", myComics: "I miei Fumetti",
      characters: "I miei Personaggi", covers: "Copertine IA", shorts: "Cortometraggi IA", drafts: "Bozze"
    },
    hero: {
      badge: "Motore IA Generativo per Fumetti · Comic Crafter",
      title1: "Trasforma le tue",
      title2: "storie in fumetti",
      title3: "con l'IA",
      subtitle: "Carica le tue foto, racconta la tua storia e lascia che la nostra IA generi un fumetto professionale in stile anime, manga o quello che preferisci.",
      cta1: "Crea il mio Fumetto",
      cta2: "Vedi i miei Fumetti",
      f1title: "Carica Foto", f1desc: "Carica foto reali e l'IA creerà personaggi basati su di esse",
      f2title: "Racconta la tua Storia", f2desc: "Scrivi la trama e l'IA genera sceneggiatura, dialoghi e vignette",
      f3title: "Arte Professionale", f3desc: "Scegli tra stili manga, anime, noir, fantasy e altro",
    }
  },
  pt: {
    nav: {
      home: "Início", create: "Criar Quadrinho", myComics: "Meus Quadrinhos",
      characters: "Meus Personagens", covers: "Capas IA", shorts: "Curtas IA", drafts: "Rascunhos"
    },
    hero: {
      badge: "Motor de IA Generativa para Quadrinhos · Comic Crafter",
      title1: "Transforme suas",
      title2: "histórias em quadrinhos",
      title3: "com IA",
      subtitle: "Envie suas fotos, conte sua história e deixe nossa IA gerar um quadrinho profissional no estilo anime, manga ou o que preferir.",
      cta1: "Criar meu Quadrinho",
      cta2: "Ver meus Quadrinhos",
      f1title: "Enviar Fotos", f1desc: "Envie fotos reais e a IA criará personagens baseados nelas",
      f2title: "Conte sua História", f2desc: "Escreva a trama e a IA gera roteiro, diálogos e painéis",
      f3title: "Arte Profissional", f3desc: "Escolha entre estilos manga, anime, noir, fantasia e mais",
    }
  },
  ca: {
    nav: {
      home: "Inici", create: "Crear Còmic", myComics: "Els meus Còmics",
      characters: "Els meus Personatges", covers: "Portades IA", shorts: "Curts IA", drafts: "Esborranys"
    },
    hero: {
      badge: "Motor d'IA Generativa per a Còmics · Comic Crafter",
      title1: "Converteix les teves",
      title2: "històries en còmics",
      title3: "amb IA",
      subtitle: "Puja les teves fotos, explica la teva història i deixa que la nostra IA generi un còmic professional amb estil anime, manga o el que prefereixis.",
      cta1: "Crear el meu Còmic",
      cta2: "Veure els meus Còmics",
      f1title: "Puja Fotos", f1desc: "Puja fotos reals i la IA crearà personatges basats en elles",
      f2title: "Explica la teva Història", f2desc: "Escriu la trama i la IA genera guió, diàlegs i vinyetes",
      f3title: "Art Professional", f3desc: "Tria entre estils manga, anime, noir, fantasia i més",
    }
  },
  ja: {
    nav: {
      home: "ホーム", create: "コミック作成", myComics: "マイコミック",
      characters: "マイキャラクター", covers: "AIカバー", shorts: "AIショート", drafts: "下書き"
    },
    hero: {
      badge: "コミック向け生成AI · Comic Crafter",
      title1: "あなたの",
      title2: "ストーリーをコミックに",
      title3: "AIで変換",
      subtitle: "写真をアップロードし、ストーリーを語り、AIがアニメ・マンガなどのスタイルでプロのコミックを生成します。",
      cta1: "コミックを作る",
      cta2: "マイコミックを見る",
      f1title: "写真をアップ", f1desc: "実際の写真をアップロードすると、AIがそれに基づいたキャラクターを作成します",
      f2title: "ストーリーを語る", f2desc: "プロットを書くと、AIがスクリプト、セリフ、パネルを生成します",
      f3title: "プロのアート", f3desc: "マンガ、アニメ、ノワール、ファンタジーなどのスタイルから選択",
    }
  },
  zh: {
    nav: {
      home: "首页", create: "创建漫画", myComics: "我的漫画",
      characters: "我的角色", covers: "AI封面", shorts: "AI短片", drafts: "草稿"
    },
    hero: {
      badge: "漫画生成AI引擎 · Comic Crafter",
      title1: "将你的",
      title2: "故事变成漫画",
      title3: "用AI",
      subtitle: "上传你的照片，讲述你的故事，让我们的AI以动漫、漫画或你喜欢的任何风格生成专业漫画。",
      cta1: "创建我的漫画",
      cta2: "查看我的漫画",
      f1title: "上传照片", f1desc: "上传真实照片，AI将根据它们创建角色",
      f2title: "讲述你的故事", f2desc: "写下情节，AI生成剧本、对话和面板",
      f3title: "专业艺术", f3desc: "从漫画、动漫、黑色、奇幻等风格中选择",
    }
  },
  ar: {
    nav: {
      home: "الرئيسية", create: "إنشاء كوميك", myComics: "كوميكاتي",
      characters: "شخصياتي", covers: "أغلفة AI", shorts: "مقاطع AI", drafts: "المسودات"
    },
    hero: {
      badge: "محرك الذكاء الاصطناعي للكوميك · Comic Crafter",
      title1: "حوّل قصصك",
      title2: "إلى كوميك",
      title3: "بالذكاء الاصطناعي",
      subtitle: "ارفع صورك، احكِ قصتك ودع الذكاء الاصطناعي يُنشئ كوميكًا احترافيًا بأسلوب أنيمي أو مانغا أو ما تفضله.",
      cta1: "إنشاء كوميكي",
      cta2: "عرض كوميكاتي",
      f1title: "ارفع الصور", f1desc: "ارفع صورًا حقيقية وسيُنشئ الذكاء الاصطناعي شخصيات بناءً عليها",
      f2title: "احكِ قصتك", f2desc: "اكتب الحبكة وسيُولّد الذكاء الاصطناعي السيناريو والحوارات واللوحات",
      f3title: "فن احترافي", f3desc: "اختر بين أساليب المانغا والأنيمي والنوار والفانتازيا والمزيد",
    }
  },
  ru: {
    nav: {
      home: "Главная", create: "Создать комикс", myComics: "Мои комиксы",
      characters: "Мои персонажи", covers: "Обложки ИИ", shorts: "Короткие ИИ", drafts: "Черновики"
    },
    hero: {
      badge: "Генеративный ИИ для комиксов · Comic Crafter",
      title1: "Превратите ваши",
      title2: "истории в комиксы",
      title3: "с помощью ИИ",
      subtitle: "Загрузите фотографии, расскажите историю и пусть наш ИИ создаст профессиональный комикс в стиле аниме, манга или любом другом.",
      cta1: "Создать мой комикс",
      cta2: "Мои комиксы",
      f1title: "Загрузить фото", f1desc: "Загрузите реальные фото, и ИИ создаст на их основе персонажей",
      f2title: "Рассказать историю", f2desc: "Напишите сюжет, и ИИ сгенерирует сценарий, диалоги и панели",
      f3title: "Профессиональное искусство", f3desc: "Выбирайте из стилей манга, аниме, нуар, фэнтези и других",
    }
  },
  pl: {
    nav: {
      home: "Strona główna", create: "Utwórz komiks", myComics: "Moje komiksy",
      characters: "Moje postacie", covers: "Okładki AI", shorts: "Shorty AI", drafts: "Szkice"
    },
    hero: {
      badge: "Generatywne AI dla komiksów · Comic Crafter",
      title1: "Zamień swoje",
      title2: "historie w komiksy",
      title3: "z AI",
      subtitle: "Prześlij zdjęcia, opowiedz historię i pozwól naszemu AI stworzyć profesjonalny komiks w stylu anime, manga lub innym.",
      cta1: "Utwórz mój komiks",
      cta2: "Moje komiksy",
      f1title: "Prześlij zdjęcia", f1desc: "Prześlij prawdziwe zdjęcia, a AI stworzy postacie na ich podstawie",
      f2title: "Opowiedz historię", f2desc: "Napisz fabułę, a AI wygeneruje scenariusz, dialogi i panele",
      f3title: "Profesjonalna sztuka", f3desc: "Wybieraj spośród stylów manga, anime, noir, fantasy i innych",
    }
  },
  nl: {
    nav: {
      home: "Start", create: "Strip maken", myComics: "Mijn strips",
      characters: "Mijn personages", covers: "AI-covers", shorts: "AI-shorts", drafts: "Concepten"
    },
    hero: {
      badge: "Generatieve AI-engine voor strips · Comic Crafter",
      title1: "Zet je",
      title2: "verhalen om in strips",
      title3: "met AI",
      subtitle: "Upload je foto's, vertel je verhaal en laat onze AI een professionele strip maken in anime-, manga- of een andere stijl.",
      cta1: "Mijn strip maken",
      cta2: "Mijn strips bekijken",
      f1title: "Foto's uploaden", f1desc: "Upload echte foto's en AI maakt personages op basis daarvan",
      f2title: "Vertel je verhaal", f2desc: "Schrijf de plot en AI genereert script, dialogen en panelen",
      f3title: "Professionele kunst", f3desc: "Kies uit manga-, anime-, noir-, fantasy-stijlen en meer",
    }
  },
  ko: {
    nav: {
      home: "홈", create: "만화 만들기", myComics: "내 만화",
      characters: "내 캐릭터", covers: "AI 표지", shorts: "AI 단편", drafts: "초안"
    },
    hero: {
      badge: "만화를 위한 생성 AI · Comic Crafter",
      title1: "당신의",
      title2: "이야기를 만화로",
      title3: "AI로 변환",
      subtitle: "사진을 업로드하고 이야기를 들려주면 AI가 애니메, 망가 등의 스타일로 전문적인 만화를 만들어 드립니다.",
      cta1: "내 만화 만들기",
      cta2: "내 만화 보기",
      f1title: "사진 업로드", f1desc: "실제 사진을 업로드하면 AI가 그것을 기반으로 캐릭터를 만듭니다",
      f2title: "이야기 들려주기", f2desc: "줄거리를 쓰면 AI가 스크립트, 대화, 패널을 생성합니다",
      f3title: "전문 아트", f3desc: "망가, 애니메, 누아르, 판타지 등 스타일 선택",
    }
  },
  tr: {
    nav: {
      home: "Ana Sayfa", create: "Çizgi Roman Oluştur", myComics: "Çizgi Romanlarım",
      characters: "Karakterlerim", covers: "AI Kapaklar", shorts: "AI Kısa Filmler", drafts: "Taslaklar"
    },
    hero: {
      badge: "Çizgi Roman için Üretken AI Motoru · Comic Crafter",
      title1: "Hikayelerini",
      title2: "çizgi romana dönüştür",
      title3: "AI ile",
      subtitle: "Fotoğraflarını yükle, hikayeni anlat ve AI'mızın anime, manga veya istediğin stilde profesyonel bir çizgi roman oluşturmasına izin ver.",
      cta1: "Çizgi Romanımı Oluştur",
      cta2: "Çizgi Romanlarımı Gör",
      f1title: "Fotoğraf Yükle", f1desc: "Gerçek fotoğraflar yükle, AI onlara dayalı karakterler oluşturur",
      f2title: "Hikayeni Anlat", f2desc: "Konuyu yaz, AI senaryo, diyaloglar ve paneller oluşturur",
      f3title: "Profesyonel Sanat", f3desc: "Manga, anime, noir, fantezi ve daha fazla stil arasından seç",
    }
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("cc_lang") || "es");

  useEffect(() => {
    localStorage.setItem("cc_lang", lang);
    const isRtl = LANGUAGES.find(l => l.code === lang)?.rtl;
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, [lang]);

  const t = translations[lang] || translations["es"];

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}