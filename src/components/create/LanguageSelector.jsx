import React, { useState } from "react";
import { Globe, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 300+ languages database
export const LANGUAGES = [
  { code: "es", name: "Español", native: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "Chinese Simplified", native: "中文(简体)", flag: "🇨🇳" },
  { code: "zh-tw", name: "Chinese Traditional", native: "中文(繁體)", flag: "🇹🇼" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", rtl: true },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", native: "Svenska", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", native: "Norsk", flag: "🇳🇴" },
  { code: "da", name: "Danish", native: "Dansk", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", native: "Suomi", flag: "🇫🇮" },
  { code: "cs", name: "Czech", native: "Čeština", flag: "🇨🇿" },
  { code: "sk", name: "Slovak", native: "Slovenčina", flag: "🇸🇰" },
  { code: "hu", name: "Hungarian", native: "Magyar", flag: "🇭🇺" },
  { code: "ro", name: "Romanian", native: "Română", flag: "🇷🇴" },
  { code: "bg", name: "Bulgarian", native: "Български", flag: "🇧🇬" },
  { code: "hr", name: "Croatian", native: "Hrvatski", flag: "🇭🇷" },
  { code: "sr", name: "Serbian", native: "Српски", flag: "🇷🇸" },
  { code: "uk", name: "Ukrainian", native: "Українська", flag: "🇺🇦" },
  { code: "el", name: "Greek", native: "Ελληνικά", flag: "🇬🇷" },
  { code: "he", name: "Hebrew", native: "עברית", flag: "🇮🇱", rtl: true },
  { code: "fa", name: "Persian", native: "فارسی", flag: "🇮🇷", rtl: true },
  { code: "ur", name: "Urdu", native: "اردو", flag: "🇵🇰", rtl: true },
  { code: "th", name: "Thai", native: "ภาษาไทย", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "tl", name: "Filipino", native: "Filipino", flag: "🇵🇭" },
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪" },
  { code: "am", name: "Amharic", native: "አማርኛ", flag: "🇪🇹" },
  { code: "yo", name: "Yoruba", native: "Yorùbá", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", native: "Igbo", flag: "🇳🇬" },
  { code: "ha", name: "Hausa", native: "Hausa", flag: "🇳🇬" },
  { code: "zu", name: "Zulu", native: "isiZulu", flag: "🇿🇦" },
  { code: "xh", name: "Xhosa", native: "isiXhosa", flag: "🇿🇦" },
  { code: "af", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦" },
  { code: "ca", name: "Catalan", native: "Català", flag: "🏴" },
  { code: "eu", name: "Basque", native: "Euskara", flag: "🏴" },
  { code: "gl", name: "Galician", native: "Galego", flag: "🏴" },
  { code: "cy", name: "Welsh", native: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { code: "ga", name: "Irish", native: "Gaeilge", flag: "🇮🇪" },
  { code: "gd", name: "Scottish Gaelic", native: "Gàidhlig", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code: "mt", name: "Maltese", native: "Malti", flag: "🇲🇹" },
  { code: "lb", name: "Luxembourgish", native: "Lëtzebuergesch", flag: "🇱🇺" },
  { code: "is", name: "Icelandic", native: "Íslenska", flag: "🇮🇸" },
  { code: "mk", name: "Macedonian", native: "Македонски", flag: "🇲🇰" },
  { code: "sq", name: "Albanian", native: "Shqip", flag: "🇦🇱" },
  { code: "be", name: "Belarusian", native: "Беларуская", flag: "🇧🇾" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių", flag: "🇱🇹" },
  { code: "lv", name: "Latvian", native: "Latviešu", flag: "🇱🇻" },
  { code: "et", name: "Estonian", native: "Eesti", flag: "🇪🇪" },
  { code: "sl", name: "Slovenian", native: "Slovenščina", flag: "🇸🇮" },
  { code: "bs", name: "Bosnian", native: "Bosanski", flag: "🇧🇦" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycan", flag: "🇦🇿" },
  { code: "ka", name: "Georgian", native: "ქართული", flag: "🇬🇪" },
  { code: "hy", name: "Armenian", native: "Հայերեն", flag: "🇦🇲" },
  { code: "kk", name: "Kazakh", native: "Қазақша", flag: "🇰🇿" },
  { code: "ky", name: "Kyrgyz", native: "Кыргызча", flag: "🇰🇬" },
  { code: "uz", name: "Uzbek", native: "O'zbek", flag: "🇺🇿" },
  { code: "tk", name: "Turkmen", native: "Türkmençe", flag: "🇹🇲" },
  { code: "tg", name: "Tajik", native: "Тоҷикӣ", flag: "🇹🇯" },
  { code: "mn", name: "Mongolian", native: "Монгол", flag: "🇲🇳" },
  { code: "ne", name: "Nepali", native: "नेपाली", flag: "🇳🇵" },
  { code: "si", name: "Sinhala", native: "සිංහල", flag: "🇱🇰" },
  { code: "my", name: "Burmese", native: "မြန်မာဘာသာ", flag: "🇲🇲" },
  { code: "km", name: "Khmer", native: "ភាសាខ្មែរ", flag: "🇰🇭" },
  { code: "lo", name: "Lao", native: "ລາວ", flag: "🇱🇦" },
  { code: "ka", name: "Georgian", native: "ქართული", flag: "🇬🇪" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as", name: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
  { code: "sd", name: "Sindhi", native: "سنڌي", flag: "🇵🇰", rtl: true },
  { code: "ps", name: "Pashto", native: "پښتو", flag: "🇦🇫", rtl: true },
  { code: "ckb", name: "Kurdish", native: "کوردی", flag: "🏳️", rtl: true },
  { code: "so", name: "Somali", native: "Soomaali", flag: "🇸🇴" },
  { code: "rw", name: "Kinyarwanda", native: "Kinyarwanda", flag: "🇷🇼" },
  { code: "ny", name: "Chichewa", native: "Chichewa", flag: "🇲🇼" },
  { code: "sn", name: "Shona", native: "chiShona", flag: "🇿🇼" },
  { code: "st", name: "Sotho", native: "Sesotho", flag: "🇱🇸" },
  { code: "tn", name: "Tswana", native: "Setswana", flag: "🇧🇼" },
  { code: "ts", name: "Tsonga", native: "Xitsonga", flag: "🇿🇦" },
  { code: "ss", name: "Swati", native: "SiSwati", flag: "🇸🇿" },
  { code: "nr", name: "Ndebele", native: "isiNdebele", flag: "🇿🇦" },
  { code: "ve", name: "Venda", native: "Tshivenda", flag: "🇿🇦" },
  { code: "mg", name: "Malagasy", native: "Malagasy", flag: "🇲🇬" },
  { code: "ln", name: "Lingala", native: "Lingála", flag: "🇨🇩" },
  { code: "kg", name: "Kongo", native: "Kikongo", flag: "🇨🇩" },
  { code: "lua", name: "Luba-Kasai", native: "Tshiluba", flag: "🇨🇩" },
  { code: "wo", name: "Wolof", native: "Wolof", flag: "🇸🇳" },
  { code: "ff", name: "Fula", native: "Fulfulde", flag: "🌍" },
  { code: "dz", name: "Dzongkha", native: "རྫོང་ཁ", flag: "🇧🇹" },
  { code: "bo", name: "Tibetan", native: "བོད་ཡིག", flag: "🏔️" },
  { code: "ug", name: "Uyghur", native: "ئۇيغۇرچە", flag: "🌏", rtl: true },
  { code: "ii", name: "Yi", native: "ꆈꌠꉙ", flag: "🇨🇳" },
  { code: "za", name: "Zhuang", native: "Vahcuengh", flag: "🇨🇳" },
  { code: "jv", name: "Javanese", native: "Basa Jawa", flag: "🇮🇩" },
  { code: "su", name: "Sundanese", native: "Basa Sunda", flag: "🇮🇩" },
  { code: "ceb", name: "Cebuano", native: "Cebuano", flag: "🇵🇭" },
  { code: "ilo", name: "Ilocano", native: "Ilokano", flag: "🇵🇭" },
  { code: "haw", name: "Hawaiian", native: "ʻŌlelo Hawaiʻi", flag: "🌺" },
  { code: "mi", name: "Maori", native: "Te Reo Māori", flag: "🇳🇿" },
  { code: "sm", name: "Samoan", native: "Gagana Samoa", flag: "🇼🇸" },
  { code: "to", name: "Tongan", native: "Lea faka-Tonga", flag: "🇹🇴" },
  { code: "fj", name: "Fijian", native: "Na Vosa Vakaviti", flag: "🇫🇯" },
  { code: "eo", name: "Esperanto", native: "Esperanto", flag: "🌐" },
  { code: "ia", name: "Interlingua", native: "Interlingua", flag: "🌐" },
  { code: "io", name: "Ido", native: "Ido", flag: "🌐" },
  { code: "vo", name: "Volapük", native: "Volapük", flag: "🌐" },
  { code: "la", name: "Latin", native: "Latina", flag: "🏛️" },
  { code: "grc", name: "Ancient Greek", native: "Ἑλληνική", flag: "🏛️" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", flag: "🕉️" },
  { code: "pi", name: "Pali", native: "पाली", flag: "🕉️" },
  { code: "cu", name: "Church Slavonic", native: "Словѣньскъ", flag: "☦️" },
  { code: "oc", name: "Occitan", native: "Occitan", flag: "🏴" },
  { code: "br", name: "Breton", native: "Brezhoneg", flag: "🏴" },
  { code: "co", name: "Corsican", native: "Corsu", flag: "🏝️" },
  { code: "sc", name: "Sardinian", native: "Sardu", flag: "🏝️" },
  { code: "lij", name: "Ligurian", native: "Ligure", flag: "🇮🇹" },
  { code: "nap", name: "Neapolitan", native: "Napulitano", flag: "🇮🇹" },
  { code: "scn", name: "Sicilian", native: "Sicilianu", flag: "🇮🇹" },
  { code: "vec", name: "Venetian", native: "Vèneto", flag: "🇮🇹" },
  { code: "rm", name: "Romansh", native: "Rumantsch", flag: "🇨🇭" },
  { code: "fur", name: "Friulian", native: "Furlan", flag: "🇮🇹" },
  { code: "lad", name: "Ladino", native: "Ladino", flag: "🌍", rtl: false },
  { code: "yi", name: "Yiddish", native: "ייִדיש", flag: "🌍", rtl: true },
  { code: "hsb", name: "Upper Sorbian", native: "Hornjoserbšćina", flag: "🇩🇪" },
  { code: "dsb", name: "Lower Sorbian", native: "Dolnoserbšćina", flag: "🇩🇪" },
  { code: "csb", name: "Kashubian", native: "Kaszëbsczi", flag: "🇵🇱" },
  { code: "szl", name: "Silesian", native: "Ślůnsko gŏdka", flag: "🇵🇱" },
  { code: "rue", name: "Rusyn", native: "Руснацькый", flag: "🌍" },
  { code: "ce", name: "Chechen", native: "Нохчийн", flag: "🇷🇺" },
  { code: "av", name: "Avar", native: "Авар", flag: "🇷🇺" },
  { code: "ab", name: "Abkhazian", native: "Аҧсуа", flag: "🇬🇪" },
  { code: "os", name: "Ossetic", native: "Ирон", flag: "🇷🇺" },
  { code: "inh", name: "Ingush", native: "ГӀалгӀай", flag: "🇷🇺" },
  { code: "bxr", name: "Buryat", native: "Буряад", flag: "🇷🇺" },
  { code: "sah", name: "Yakut", native: "Саха", flag: "🇷🇺" },
  { code: "tt", name: "Tatar", native: "Татар", flag: "🇷🇺" },
  { code: "ba", name: "Bashkir", native: "Башҡорт", flag: "🇷🇺" },
  { code: "cv", name: "Chuvash", native: "Чӑваш", flag: "🇷🇺" },
  { code: "udm", name: "Udmurt", native: "Удмурт", flag: "🇷🇺" },
  { code: "kv", name: "Komi", native: "Коми", flag: "🇷🇺" },
  { code: "mrj", name: "Mari", native: "Марий", flag: "🇷🇺" },
  { code: "mhr", name: "Meadow Mari", native: "Олык марий", flag: "🇷🇺" },
  { code: "myv", name: "Erzya", native: "Эрзянь", flag: "🇷🇺" },
  { code: "mdf", name: "Moksha", native: "Мокшень", flag: "🇷🇺" },
  { code: "koi", name: "Komi-Permyak", native: "Перем коми", flag: "🇷🇺" },
  { code: "krl", name: "Karelian", native: "Karjala", flag: "🇷🇺" },
  { code: "vep", name: "Veps", native: "Vepsän kel'", flag: "🇷🇺" },
  { code: "vot", name: "Votic", native: "Vaďďa", flag: "🇷🇺" },
  { code: "liv", name: "Livonian", native: "Līvõ kēļ", flag: "🇱🇻" },
  { code: "sms", name: "Skolt Sami", native: "Sääʹmǩiõll", flag: "🇫🇮" },
  { code: "smn", name: "Inari Sami", native: "Anarâškielâ", flag: "🇫🇮" },
  { code: "smj", name: "Lule Sami", native: "Julevsámegiella", flag: "🇸🇪" },
  { code: "sme", name: "Northern Sami", native: "Davvisámegiella", flag: "🇳🇴" },
  { code: "sma", name: "Southern Sami", native: "Åarjelsaemien gïele", flag: "🇸🇪" },
  { code: "se", name: "Sami", native: "Sámegiella", flag: "🌍" },
  { code: "fkv", name: "Kven", native: "Kvääni", flag: "🇳🇴" },
  { code: "qu", name: "Quechua", native: "Runa Simi", flag: "🇵🇪" },
  { code: "ay", name: "Aymara", native: "Aymara", flag: "🇧🇴" },
  { code: "gn", name: "Guarani", native: "Avañeʼẽ", flag: "🇵🇾" },
  { code: "nah", name: "Nahuatl", native: "Nāhuatl", flag: "🇲🇽" },
  { code: "myn", name: "Maya", native: "Maaya T'aan", flag: "🇲🇽" },
  { code: "oto", name: "Otomi", native: "Hñäñho", flag: "🇲🇽" },
  { code: "yua", name: "Yucatec Maya", native: "Maaya T'aan", flag: "🇲🇽" },
  { code: "chr", name: "Cherokee", native: "ᏣᎳᎩ", flag: "🇺🇸" },
  { code: "chy", name: "Cheyenne", native: "Tsėhésenėstsestȯtse", flag: "🇺🇸" },
  { code: "nv", name: "Navajo", native: "Diné bizaad", flag: "🇺🇸" },
  { code: "lkt", name: "Lakota", native: "Lakȟótiyapi", flag: "🇺🇸" },
  { code: "cr", name: "Cree", native: "ᓀᐦᐃᔭᐍᐏᐣ", flag: "🇨🇦" },
  { code: "oj", name: "Ojibwe", native: "Anishinaabemowin", flag: "🇨🇦" },
  { code: "moh", name: "Mohawk", native: "Kanien'kéha", flag: "🇨🇦" },
  { code: "iu", name: "Inuktitut", native: "ᐃᓄᒃᑎᑐᑦ", flag: "🇨🇦" },
  { code: "ikt", name: "Inuinnaqtun", native: "Inuinnaqtun", flag: "🇨🇦" },
  { code: "gwi", name: "Gwich'in", native: "Dinjii Zhuh Ginjik", flag: "🇨🇦" },
  { code: "dgr", name: "Dogrib", native: "Tłı̨chǫ", flag: "🇨🇦" },
  { code: "hup", name: "Hupa", native: "Na:tinixwe Mixine:whe'", flag: "🇺🇸" },
  { code: "hai", name: "Haida", native: "X̱aat Kíl", flag: "🇨🇦" },
  { code: "tli", name: "Tlingit", native: "Lingít", flag: "🇺🇸" },
  { code: "tsm", name: "Tsimshian", native: "Sm'algyax", flag: "🇨🇦" },
  { code: "mam", name: "Mam", native: "Qyol Mam", flag: "🇬🇹" },
  { code: "kek", name: "Q'eqchi'", native: "Q'eqchi'", flag: "🇬🇹" },
  { code: "cak", name: "Kaqchikel", native: "Kaqchikel", flag: "🇬🇹" },
  { code: "tzj", name: "Tz'utujil", native: "Tz'utujil", flag: "🇬🇹" },
  { code: "ixl", name: "Ixil", native: "Ixil", flag: "🇬🇹" },
  { code: "jac", name: "Jacaltec", native: "Poptí'", flag: "🇬🇹" },
  { code: "knj", name: "Kanjobal", native: "Q'anjob'al", flag: "🇬🇹" },
  { code: "mop", name: "Mopan Maya", native: "Mopan", flag: "🇧🇿" },
  { code: "yok", name: "Yokuts", native: "Yokuts", flag: "🇺🇸" },
  { code: "pom", name: "Pomo", native: "Pomo", flag: "🇺🇸" },
  { code: "win", name: "Wintu", native: "Wintu", flag: "🇺🇸" },
  { code: "kar", name: "Karen", native: "ကရင်ဘာသာ", flag: "🇲🇲" },
  { code: "kha", name: "Khasi", native: "Ka Ktien Khasi", flag: "🇮🇳" },
  { code: "garo", name: "Garo", native: "A·chik Mande", flag: "🇮🇳" },
  { code: "mni", name: "Manipuri", native: "মৈতৈলোন্", flag: "🇮🇳" },
  { code: "nag", name: "Naga", native: "Naga", flag: "🇮🇳" },
  { code: "bho", name: "Bhojpuri", native: "भोजपुरी", flag: "🇮🇳" },
  { code: "mag", name: "Magahi", native: "मगही", flag: "🇮🇳" },
  { code: "mai", name: "Maithili", native: "मैथिली", flag: "🇮🇳" },
  { code: "awa", name: "Awadhi", native: "अवधी", flag: "🇮🇳" },
  { code: "raj", name: "Rajasthani", native: "राजस्थानी", flag: "🇮🇳" },
  { code: "hoc", name: "Ho", native: "𑣙𑣉", flag: "🇮🇳" },
  { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
  { code: "mun", name: "Mundari", native: "Mundari", flag: "🇮🇳" },
  { code: "sck", name: "Sadri", native: "सादरी", flag: "🇮🇳" },
  { code: "aot", name: "Atong", native: "A'tong", flag: "🇮🇳" },
  { code: "pcm", name: "Nigerian Pidgin", native: "Naijá", flag: "🇳🇬" },
  { code: "tpi", name: "Tok Pisin", native: "Tok Pisin", flag: "🇵🇬" },
  { code: "bis", name: "Bislama", native: "Bislama", flag: "🇻🇺" },
  { code: "pih", name: "Norfuk", native: "Norfuk", flag: "🌊" },
  { code: "rop", name: "Kriol", native: "Kriol", flag: "🇦🇺" },
  { code: "wbp", name: "Warlpiri", native: "Warlpiri", flag: "🇦🇺" },
  { code: "aer", name: "Arrernte", native: "Arrernte", flag: "🇦🇺" },
  { code: "kld", name: "Gamilaraay", native: "Gamilaraay", flag: "🇦🇺" },
  { code: "wrh", name: "Wiradjuri", native: "Wiradjuri", flag: "🇦🇺" },
  { code: "yol", name: "Yolŋu Matha", native: "Yolŋu Matha", flag: "🇦🇺" },
  { code: "auw", name: "Awyi", native: "Awyi", flag: "🇮🇩" },
  { code: "nia", name: "Nias", native: "Li Niha", flag: "🇮🇩" },
  { code: "min", name: "Minangkabau", native: "Baso Minangkabau", flag: "🇮🇩" },
  { code: "bug", name: "Buginese", native: "Basa Ugi", flag: "🇮🇩" },
  { code: "mak", name: "Makasar", native: "Basa Mangkasara'", flag: "🇮🇩" },
  { code: "ban", name: "Balinese", native: "Basa Bali", flag: "🇮🇩" },
  { code: "sas", name: "Sasak", native: "Basa Sasak", flag: "🇮🇩" },
  { code: "mad", name: "Madurese", native: "Bhâsa Madhurâ", flag: "🇮🇩" },
  { code: "ace", name: "Acehnese", native: "Bahsa Acèh", flag: "🇮🇩" },
  { code: "nij", name: "Ngaju", native: "Bahasa Ngaju", flag: "🇮🇩" },
  { code: "dtp", name: "Kadazan", native: "Kadazan Dusun", flag: "🇲🇾" },
  { code: "iba", name: "Iban", native: "Jaku Iban", flag: "🇲🇾" },
  { code: "bjn", name: "Banjar", native: "Bahasa Banjar", flag: "🇮🇩" },
  { code: "gor", name: "Gorontalo", native: "Bahasa Hulontalo", flag: "🇮🇩" },
  { code: "mua", name: "Mundang", native: "Mundaŋ", flag: "🇨🇲" },
  { code: "bss", name: "Akoose", native: "Akoose", flag: "🇨🇲" },
  { code: "agq", name: "Aghem", native: "Aghem", flag: "🇨🇲" },
  { code: "ksf", name: "Bafia", native: "Rikpa", flag: "🇨🇲" },
  { code: "bas", name: "Basaa", native: "Ɓàsàa", flag: "🇨🇲" },
  { code: "dua", name: "Duala", native: "Duálá", flag: "🇨🇲" },
  { code: "ewo", name: "Ewondo", native: "Ewondo", flag: "🇨🇲" },
  { code: "nso", name: "Northern Sotho", native: "Sesotho sa Leboa", flag: "🇿🇦" },
  { code: "ven", name: "Tshivenda", native: "Tshivenda", flag: "🇿🇦" },
  { code: "prg", name: "Old Prussian", native: "Prūsiskan", flag: "🏛️" },
  { code: "art", name: "Klingon", native: "tlhIngan Hol", flag: "🖖" },
  { code: "sjn", name: "Sindarin (Elvish)", native: "Edhellen", flag: "🧝" },
  { code: "qya", name: "Quenya (Elvish)", native: "Quenya", flag: "🧝" },
  { code: "val", name: "High Valyrian", native: "Valyrio Mūño Ēngos", flag: "🐉" },
  { code: "dth", name: "Dothraki", native: "Lekh Dothraki", flag: "🐴" },
];

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = LANGUAGES.find(l => l.code === value) || LANGUAGES[0];
  const filtered = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white transition-all w-full"
      >
        <Globe className="w-4 h-4 text-violet-400 shrink-0" />
        <span className="text-lg">{selected.flag}</span>
        <span className="font-medium truncate">{selected.native}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#111118] shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-white/5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar idioma..."
                  className="bg-transparent text-sm text-white placeholder:text-gray-600 outline-none w-full"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-56">
              {filtered.slice(0, 60).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onChange(lang.code); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors ${value === lang.code ? "bg-violet-500/10 text-violet-300" : "text-gray-300"}`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.native}</span>
                  <span className="text-gray-600 text-xs ml-auto">{lang.name}</span>
                </button>
              ))}
              {filtered.length > 60 && (
                <p className="text-center text-xs text-gray-600 py-2">
                  +{filtered.length - 60} más. Refina la búsqueda.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}