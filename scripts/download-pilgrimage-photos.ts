#!/usr/bin/env tsx
/**
 * Download pilgrimage site/route photos from Wikipedia / Wikimedia Commons
 * into public/pilgrimage/, and write src/data/pilgrimage-images.json.
 *
 * Usage:
 *   npm run download-pilgrimage-photos
 *   npm run download-pilgrimage-photos -- --dry-run
 *   npm run download-pilgrimage-photos -- --force
 *   npm run download-pilgrimage-photos -- --limit=5
 */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  PILGRIMAGE_ROUTES,
  PILGRIMAGE_SITES,
} from "../src/data/pilgrimage";
import { fetchJson, USER_AGENT } from "./sources/http";
import { normalizeWikimediaThumb, verifyImageUrl } from "./sources/imagesearch";
import { findVenueImage } from "./sources/place-imagesearch";

const ROOT = join(import.meta.dirname, "..");
const OUTPUT_DIR = join(ROOT, "public/pilgrimage");
const MANIFEST_PATH = join(ROOT, "src/data/pilgrimage-images.json");

const WP_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : 0;

/** Curated Wikipedia titles for higher hit-rate on famous sacred sites. */
const WIKIPEDIA_TITLES: Record<string, string[]> = {
  lumbini: ["Lumbini", "Maya Devi Temple, Lumbini"],
  "bodh-gaya": ["Mahabodhi Temple", "Bodh Gaya"],
  sarnath: ["Sarnath", "Dhamek Stupa"],
  kushinagar: ["Kushinagar", "Parinirvana Temple"],
  rajgir: ["Rajgir", "Vulture Peak"],
  shravasti: ["Shravasti", "Jetavana"],
  vaishali: ["Vaishali (ancient city)", "Vaishali"],
  nalanda: ["Nalanda mahavihara", "Nalanda"],
  sanchi: ["Sanchi", "Sanchi Stupa"],
  anuradhapura: ["Anuradhapura", "Jaya Sri Maha Bodhi"],
  "kandy-tooth-relic": ["Temple of the Tooth", "Sri Dalada Maligawa"],
  borobudur: ["Borobudur"],
  shwedagon: ["Shwedagon Pagoda"],
  "angkor-wat": ["Angkor Wat"],
  jokhang: ["Jokhang"],
  "mount-kailash": ["Mount Kailash"],
  samye: ["Samye"],
  koyasan: ["Mount Kōya", "Mount Koya", "Kongōbu-ji"],
  "kyoto-kinkaku": ["Kinkaku-ji", "Kyoto"],
  "wutai-shan": ["Mount Wutai"],
  "putuo-shan": ["Mount Putuo"],
  "plum-village": ["Plum Village Tradition", "Plum Village (Monastery)"],
  "ryozen-ji": ["Ryōzen-ji", "Ryozen-ji"],
  "shosan-ji": ["Shōsan-ji", "Shosan-ji"],
  "hotsumisaki-ji": ["Hotsumisaki-ji", "Hotsumisakiji"],
  "kongofuku-ji": ["Kongōfuku-ji", "Kongofuku-ji"],
  "ishite-ji": ["Ishite-ji", "Ishiteji"],
  "zentsu-ji": ["Zentsū-ji", "Zentsu-ji"],
  "okubo-ji": ["Ōkubo-ji", "Okubo-ji"],
  "seiganto-ji": ["Seiganto-ji"],
  "hase-dera": ["Hase-dera (Sakurai)", "Hasedera"],
  "ishiyama-dera": ["Ishiyama-dera"],
  "kiyomizu-dera": ["Kiyomizu-dera"],
  "kumano-hongu": ["Kumano Hongū Taisha", "Kumano Hongu Taisha"],
  "kumano-nachi": ["Kumano Nachi Taisha"],
  "kumano-hayatama": ["Kumano Hayatama Taisha"],
  "lake-manasarovar": ["Lake Manasarovar"],
  "emei-shan": ["Mount Emei", "Emei Shan"],
  "jiuhua-shan": ["Mount Jiuhua", "Jiuhua Shan"],
  "sri-pada": ["Adam's Peak", "Sri Pada"],
  polonnaruwa: ["Polonnaruwa"],
  swayambhunath: ["Swayambhunath"],
  boudhanath: ["Boudhanath"],
  bagan: ["Bagan", "Bagan temples"],
  mahamuni: ["Mahamuni Buddha Temple", "Mahamuni"],
  potala: ["Potala Palace"],
  drepung: ["Drepung Monastery"],
  sera: ["Sera Monastery"],
  "mount-haguro": ["Mount Haguro"],
  "mount-gassan": ["Mount Gassan", "Gassan Shrine"],
  "mount-yudono": ["Yudonosan Shrine", "Mount Yudono", "Yudonosan"],
  "four-great-sites": ["Buddhist pilgrimage sites", "Mahabodhi Temple"],
  "buddhist-circuit-india": ["Buddhist pilgrimage", "Bodh Gaya"],
  "kathmandu-valley": ["Boudhanath", "Swayambhunath"],
  "sri-lanka-sacred-cities": ["Anuradhapura", "Polonnaruwa"],
  "sri-pada-ascent": ["Adam's Peak"],
  "shikoku-88": ["Shikoku Pilgrimage"],
  "saigoku-kannon": ["Saigoku Kannon Pilgrimage", "Kiyomizu-dera"],
  "kumano-kodo": ["Kumano Kodō", "Kumano Kodo", "Kumano Hongū Taisha"],
  "dewa-sanzan": ["Three Mountains of Dewa", "Mount Haguro"],
  "kailash-kora": ["Mount Kailash", "Lake Manasarovar"],
  "lhasa-barkhor": ["Barkhor", "Potala Palace"],
  "china-four-mountains": [
    "Four Sacred Mountains of Buddhism",
    "Mount Emei",
  ],
  "myanmar-sacred-sites": ["Shwedagon Pagoda", "Bagan"],
  "southeast-asia-stupas": ["Borobudur", "Shwedagon Pagoda", "Angkor Wat"],
  shimabuji: ["Chichibu 34 Kannon Sanctuary", "Shimabu-ji"],
  suisenji: ["Suisen-ji (Minano)", "Chichibu 34 Kannon Sanctuary"],
  "sugimoto-dera": ["Sugimoto-dera"],
  "senso-ji": ["Sensō-ji", "Senso-ji"],
  "nago-ji": ["Nago-ji"],
  "jison-in": ["Jison-in"],
  tongdosa: ["Tongdosa"],
  haeinsa: ["Haeinsa"],
  songgwangsa: ["Songgwangsa"],
  ayutthaya: ["Ayutthaya Historical Park", "Wat Phra Si Sanphet"],
  sukhothai: ["Sukhothai Historical Park", "Wat Mahathat (Sukhothai)"],
  "doi-suthep": ["Wat Phra That Doi Suthep"],
  "chichibu-34": ["Chichibu 34 Kannon Sanctuary"],
  "bando-33": ["Bandō Sanjūsankasho", "Sugimoto-dera"],
  "japan-100-kannon": ["Saigoku Kannon Pilgrimage", "Sensō-ji"],
  "choishi-michi": ["Jison-in", "Mount Kōya"],
  "korea-three-jewels": ["Haeinsa", "Tongdosa", "Songgwangsa"],
  "thailand-historic-capitals": [
    "Wat Phra That Doi Suthep",
    "Ayutthaya Historical Park",
  ],
  "goka-do": ["Chichibu 34 Kannon Sanctuary"],
  "akechi-ji": ["Chichibu 34 Kannon Sanctuary"],
  "jigen-ji": ["Chichibu 34 Kannon Sanctuary"],
  "godo-ji": ["Chichibu 34 Kannon Sanctuary"],
  "doji-do": ["Chichibu 34 Kannon Sanctuary"],
  "enyu-ji": ["Chichibu 34 Kannon Sanctuary"],
  "houn-ji": ["Chichibu 34 Kannon Sanctuary"],
  "shofuku-ji": ["Bandō Sanjūsankasho", "Sugimoto-dera"],
  "jiko-ji": ["Bandō Sanjūsankasho"],
  "mangan-ji": ["Bandō Sanjūsankasho"],
  "nichirin-ji": ["Bandō Sanjūsankasho"],
  "omi-do": ["Bandō Sanjūsankasho"],
  "chiba-dera": ["Chiba-dera", "Bandō Sanjūsankasho"],
  "kokawa-dera": ["Kokawa-dera"],
  "minamihokke-ji": ["Minamihokke-ji", "Tsubosaka-dera"],
  "mimuroto-ji": ["Mimuroto-ji"],
  "mii-dera": ["Mii-dera"],
  "choho-ji": ["Rokkaku-dō", "Chōhō-ji"],
  "soji-ji-ibaraki": ["Sōji-ji (Ibaraki)", "Sojiji Ibaraki"],
  "ichijo-ji": ["Ichijō-ji", "Ichijo-ji"],
  "hogon-ji": ["Hōgon-ji", "Hogon-ji"],
  "kegon-ji": ["Kegon-ji"],
  "yakuo-ji": ["Yakuō-ji", "Yakuo-ji"],
  "chikurin-ji": ["Chikurin-ji (Kōchi)", "Chikurin-ji"],
  "unpen-ji": ["Unpen-ji"],
  "yashima-ji": ["Yashima-ji"],
  dirapuk: ["Mount Kailash", "Kailash Mansarovar"],
  zutulpuk: ["Mount Kailash", "Kailash Mansarovar"],
  "namo-buddha": ["Namobuddha", "Namo Buddha"],
  "golden-temple-patan": ["Hiranya Varna Mahavihar", "Golden Temple Patan"],
  mihintale: ["Mihintale"],
  dambulla: ["Dambulla cave temple", "Dambulla"],
  nallathanniya: ["Adam's Peak", "Sri Pada"],
  "wat-phra-kaew": ["Wat Phra Kaew"],
  "si-satchanalai": ["Si Satchanalai Historical Park", "Si Satchanalai"],
  kyaiktiyo: ["Kyaiktiyo Pagoda", "Golden Rock"],
  sagaing: ["Sagaing", "Sagaing Hills"],
  sankassa: ["Sankissa", "Sankasya"],
  ajanta: ["Ajanta Caves"],
  ellora: ["Ellora Caves"],
  elephanta: ["Elephanta Caves"],
  amaravati: ["Amaravati Stupa", "Amaravathi (village), Guntur district"],
  nagarjunakonda: ["Nagarjunakonda"],
  vikramshila: ["Vikramashila"],
  kapilavastu: ["Tilaurakot", "Kapilavastu (ancient city)"],
  varanasi: ["Kashi Vishwanath Temple", "Varanasi"],
  kedarnath: ["Kedarnath Temple", "Kedarnath"],
  badrinath: ["Badrinath Temple"],
  rameswaram: ["Ramanathaswamy Temple", "Rameswaram"],
  dwarka: ["Dwarkadhish Temple", "Dwarka"],
  "jagannath-puri": ["Jagannath Temple, Puri"],
  tirupati: ["Venkateswara Temple, Tirumala", "Tirumala"],
  mathura: ["Krishna Janmasthan Temple Complex", "Mathura"],
  haridwar: ["Haridwar", "Har Ki Pauri"],
  "meenakshi-madurai": ["Meenakshi Temple", "Meenakshi Amman Temple"],
  konark: ["Konark Sun Temple"],
  khajuraho: ["Khajuraho Group of Monuments", "Lakshmana Temple, Khajuraho"],
  amarnath: ["Amarnath Temple", "Amarnath cave"],
  pashupatinath: ["Pashupatinath Temple"],
  taxila: ["Taxila", "Dharmarajika Stupa"],
  "takht-i-bahi": ["Takht-i-Bahi"],
  "leshan-buddha": ["Leshan Giant Buddha"],
  "mogao-caves": ["Mogao Caves"],
  yungang: ["Yungang Grottoes"],
  longmen: ["Longmen Grottoes"],
  "white-horse-temple": ["White Horse Temple"],
  shaolin: ["Shaolin Monastery"],
  "big-wild-goose": ["Giant Wild Goose Pagoda"],
  "todai-ji": ["Tōdai-ji", "Todai-ji"],
  "horyu-ji": ["Hōryū-ji", "Horyu-ji"],
  "enryaku-ji": ["Enryaku-ji"],
  "byodo-in": ["Byōdō-in", "Byodo-in"],
  bulguksa: ["Bulguksa"],
  seokguram: ["Seokguram"],
  "that-luang": ["Pha That Luang"],
  "wat-xieng-thong": ["Wat Xieng Thong"],
  prambanan: ["Prambanan"],
  mendut: ["Mendut", "Mendut Temple"],
  "phra-pathom": ["Phra Pathommachedi"],
  "wat-pho": ["Wat Pho"],
  "wat-arun": ["Wat Arun"],
  bayon: ["Bayon"],
  "my-son": ["Mỹ Sơn", "My Son"],
  "perfume-pagoda": ["Perfume Pagoda", "Hương Temple"],
  "kek-lok-si": ["Kek Lok Si"],
  "batu-caves": ["Batu Caves"],
  tashilhunpo: ["Tashi Lhunpo Monastery", "Tashilhunpo"],
  ganden: ["Ganden Monastery"],
  hemis: ["Hemis Monastery"],
  "erdene-zuu": ["Erdene Zuu Monastery"],
  gandan: ["Gandantegchinlen Monastery"],
  "hindu-char-dham": ["Char Dham", "Badrinath Temple"],
  "chota-char-dham": ["Chota Char Dham", "Kedarnath Temple"],
  "hindu-sacred-cities": ["Varanasi", "Meenakshi Temple"],
  "india-rock-cut": ["Ajanta Caves", "Ellora Caves"],
  "gandhara-heritage": ["Taxila", "Takht-i-Bahi"],
  "china-grottoes": ["Mogao Caves", "Longmen Grottoes"],
  "nara-kyoto-ancient": ["Tōdai-ji", "Hōryū-ji"],
  "java-temple-plain": ["Borobudur", "Prambanan"],
  "mekong-theravada": ["Pha That Luang", "Angkor Wat"],
  "mongolia-buddhist": ["Erdene Zuu Monastery", "Gandantegchinlen Monastery"],
  "gokuraku-ji": ["Gokuraku-ji", "Shikoku Pilgrimage"],
  "konsen-ji": ["Konsen-ji", "Shikoku Pilgrimage"],
  "shikoku-dainichi-ji-4": ["Dainichi-ji", "Shikoku Pilgrimage"],
  "jizo-ji": ["Jizo-ji", "Shikoku Pilgrimage"],
  "shikoku-anraku-ji-6": ["Anraku-ji", "Shikoku Pilgrimage"],
  "juraku-ji": ["Juraku-ji", "Shikoku Pilgrimage"],
  "kumadani-ji": ["Kumadani-ji", "Shikoku Pilgrimage"],
  "horin-ji": ["Horin-ji", "Shikoku Pilgrimage"],
  "kirihata-ji": ["Kirihata-ji", "Shikoku Pilgrimage"],
  "shikoku-fujii-dera-11": ["Fujii-dera", "Shikoku Pilgrimage"],
  "shikoku-dainichi-ji-13": ["Dainichi-ji", "Shikoku Pilgrimage"],
  "shikoku-joraku-ji-14": ["Joraku-ji", "Shikoku Pilgrimage"],
  "awa-kokubun-ji": ["Awa Kokubun-ji", "Shikoku Pilgrimage"],
  "shikoku-kannon-ji-16": ["Kannon-ji", "Shikoku Pilgrimage"],
  "ido-ji": ["Ido-ji", "Shikoku Pilgrimage"],
  "onzan-ji": ["Onzan-ji", "Shikoku Pilgrimage"],
  "tatsue-ji": ["Tatsue-ji", "Shikoku Pilgrimage"],
  "kakurin-ji": ["Kakurin-ji", "Shikoku Pilgrimage"],
  "tairyu-ji": ["Tairyu-ji", "Shikoku Pilgrimage"],
  "byodo-ji": ["Byodo-ji", "Shikoku Pilgrimage"],
  "shinsho-ji": ["Shinsho-ji", "Shikoku Pilgrimage"],
  "kongocho-ji": ["Kongocho-ji", "Shikoku Pilgrimage"],
  "konomine-ji": ["Konomine-ji", "Shikoku Pilgrimage"],
  "shikoku-dainichi-ji-28": ["Dainichi-ji", "Shikoku Pilgrimage"],
  "tosa-kokubun-ji": ["Tosa Kokubun-ji", "Shikoku Pilgrimage"],
  "zenraku-ji": ["Zenraku-ji", "Shikoku Pilgrimage"],
  "zenjibu-ji": ["Zenjibu-ji", "Shikoku Pilgrimage"],
  "sekkei-ji": ["Sekkei-ji", "Shikoku Pilgrimage"],
  "tanema-ji": ["Tanema-ji", "Shikoku Pilgrimage"],
  "shikoku-kiyotaki-ji-35": ["Kiyotaki-ji", "Shikoku Pilgrimage"],
  "shoryu-ji": ["Shoryu-ji", "Shikoku Pilgrimage"],
  "iwamoto-ji": ["Iwamoto-ji", "Shikoku Pilgrimage"],
  "enko-ji": ["Enko-ji", "Shikoku Pilgrimage"],
  "kanjizai-ji": ["Kanjizai-ji", "Shikoku Pilgrimage"],
  "ryuko-ji": ["Ryuko-ji", "Shikoku Pilgrimage"],
  "butsumoku-ji": ["Butsumoku-ji", "Shikoku Pilgrimage"],
  "meiseki-ji": ["Meiseki-ji", "Shikoku Pilgrimage"],
  "daiho-ji": ["Daiho-ji", "Shikoku Pilgrimage"],
  "iwaya-ji": ["Iwaya-ji", "Shikoku Pilgrimage"],
  "joruri-ji": ["Joruri-ji", "Shikoku Pilgrimage"],
  "yasaka-ji": ["Yasaka-ji", "Shikoku Pilgrimage"],
  "sairin-ji": ["Sairin-ji", "Shikoku Pilgrimage"],
  "jodo-ji": ["Jodo-ji", "Shikoku Pilgrimage"],
  "hanta-ji": ["Hanta-ji", "Shikoku Pilgrimage"],
  "shikoku-taisan-ji-52": ["Taisan-ji", "Shikoku Pilgrimage"],
  "enmyo-ji": ["Enmyo-ji", "Shikoku Pilgrimage"],
  "enmei-ji": ["Enmei-ji", "Shikoku Pilgrimage"],
  "nankobo": ["Nankobo", "Shikoku Pilgrimage"],
  "shikoku-taisan-ji-56": ["Taisan-ji", "Shikoku Pilgrimage"],
  "eifuku-ji": ["Eifuku-ji", "Shikoku Pilgrimage"],
  "senyu-ji": ["Senyu-ji", "Shikoku Pilgrimage"],
  "iyo-kokubun-ji": ["Iyo Kokubun-ji", "Shikoku Pilgrimage"],
  "yokomine-ji": ["Yokomine-ji", "Shikoku Pilgrimage"],
  "koon-ji": ["Koon-ji", "Shikoku Pilgrimage"],
  "hoju-ji": ["Hoju-ji", "Shikoku Pilgrimage"],
  "kichijo-ji": ["Kichijo-ji", "Shikoku Pilgrimage"],
  "maegami-ji": ["Maegami-ji", "Shikoku Pilgrimage"],
  "sankaku-ji": ["Sankaku-ji", "Shikoku Pilgrimage"],
  "daiko-ji": ["Daiko-ji", "Shikoku Pilgrimage"],
  "jinne-in": ["Jinne-in", "Shikoku Pilgrimage"],
  "shikoku-kannon-ji-69": ["Kannon-ji", "Shikoku Pilgrimage"],
  "motoyama-ji": ["Motoyama-ji", "Shikoku Pilgrimage"],
  "iyadani-ji": ["Iyadani-ji", "Shikoku Pilgrimage"],
  "mandara-ji": ["Mandara-ji", "Shikoku Pilgrimage"],
  "shusshaka-ji": ["Shusshaka-ji", "Shikoku Pilgrimage"],
  "koyama-ji": ["Koyama-ji", "Shikoku Pilgrimage"],
  "konzo-ji": ["Konzo-ji", "Shikoku Pilgrimage"],
  "doryu-ji": ["Doryu-ji", "Shikoku Pilgrimage"],
  "gosho-ji": ["Gosho-ji", "Shikoku Pilgrimage"],
  "tenno-ji": ["Tenno-ji", "Shikoku Pilgrimage"],
  "sanuki-kokubun-ji": ["Sanuki Kokubun-ji", "Shikoku Pilgrimage"],
  "shiromine-ji": ["Shiromine-ji", "Shikoku Pilgrimage"],
  "negoro-ji": ["Negoro-ji", "Shikoku Pilgrimage"],
  "ichinomiya-ji": ["Ichinomiya-ji", "Shikoku Pilgrimage"],
  "yakuri-ji": ["Yakuri-ji", "Shikoku Pilgrimage"],
  "shido-ji": ["Shido-ji", "Shikoku Pilgrimage"],
  "nagao-ji": ["Nagao-ji", "Shikoku Pilgrimage"],
  "kimii-dera": ["Kimii-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "sefuku-ji": ["Sefuku-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "saigoku-fujii-dera-5": ["Fujii-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "oka-dera": ["Oka-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "nanendo": ["Nan'end\u014d", "Nanendo", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "kami-daigo-ji": ["Kami Daigo-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "shoho-ji-iwama": ["Sh\u014dh\u014d-ji", "Shoho-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "imakumano-kannon-ji": ["Imakumano Kannon-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "rokuharamitsu-ji": ["Rokuharamitsu-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "gyogan-ji": ["Gy\u014dgan-ji", "Gyogan-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "yoshimine-dera": ["Yoshimine-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "anao-ji": ["Anao-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "katsuo-ji": ["Katsu\u014d-ji", "Katsuo-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "nakayama-dera": ["Nakayama-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "kiyomizu-dera-hyogo": ["Kiyomizu-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "engyo-ji": ["Engy\u014d-ji", "Engyo-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "nariai-ji": ["Nariai-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "matsunoo-dera": ["Matsunoo-dera", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "chomei-ji": ["Ch\u014dmei-ji", "Chomei-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "kannonsho-ji": ["Kannonsh\u014d-ji", "Kannonsho-ji", "Saigoku Kannon Pilgrimage", "Kansai Kannon Pilgrimage"],
  "shimpuku-ji": ["Shimpuku-ji", "Chichibu 34 Kannon Sanctuary"],
  "josen-ji": ["J\u014dsen-ji", "Josen-ji", "Chichibu 34 Kannon Sanctuary"],
  "kinsho-ji": ["Kinsh\u014d-ji", "Kinsho-ji", "Chichibu 34 Kannon Sanctuary"],
  "bokuun-ji": ["Boku'un-ji", "Bokuun-ji", "Chichibu 34 Kannon Sanctuary"],
  "hocho-ji": ["H\u014dch\u014d-ji", "Hocho-ji", "Chichibu 34 Kannon Sanctuary"],
  "saizen-ji": ["Saizen-ji", "Chichibu 34 Kannon Sanctuary"],
  "daiji-ji": ["Daiji-ji", "Chichibu 34 Kannon Sanctuary"],
  "chichibu-joraku-ji-11": ["J\u014draku-ji", "Joraku-ji", "Chichibu 34 Kannon Sanctuary"],
  "nosaka-ji": ["Nosaka-ji", "Chichibu 34 Kannon Sanctuary"],
  "imamiya-bo": ["Imamiya-b\u014d", "Imamiya-bo", "Chichibu 34 Kannon Sanctuary"],
  "shorin-ji": ["Sh\u014drin-ji", "Shorin-ji", "Chichibu 34 Kannon Sanctuary"],
  "saiko-ji": ["Saik\u014d-ji", "Saiko-ji", "Chichibu 34 Kannon Sanctuary"],
  "jorin-ji": ["J\u014drin-ji", "Jorin-ji", "Chichibu 34 Kannon Sanctuary"],
  "ryuseki-ji": ["Ry\u016bseki-ji", "Ryuseki-ji", "Chichibu 34 Kannon Sanctuary"],
  "iwanoue-do": ["Iwanoue-d\u014d", "Iwanoue-do", "Chichibu 34 Kannon Sanctuary"],
  "chichibu-kannon-ji-21": ["Kannon-ji", "Chichibu 34 Kannon Sanctuary"],
  "ongaku-ji": ["Ongaku-ji", "Chichibu 34 Kannon Sanctuary"],
  "hosen-ji": ["H\u014dsen-ji", "Hosen-ji", "Chichibu 34 Kannon Sanctuary"],
  "kyusho-ji": ["Ky\u016bsh\u014d-ji", "Kyusho-ji", "Chichibu 34 Kannon Sanctuary"],
  "daien-ji": ["Daien-ji", "Chichibu 34 Kannon Sanctuary"],
  "hashidate-do": ["Hashidate-d\u014d", "Hashidate-do", "Chichibu 34 Kannon Sanctuary"],
  "chosen-in": ["Ch\u014dsen-in", "Chosen-in", "Chichibu 34 Kannon Sanctuary"],
  "kannon-in": ["Kannon-in", "Chichibu 34 Kannon Sanctuary"],
  "hosho-ji": ["H\u014dsh\u014d-ji", "Hosho-ji", "Chichibu 34 Kannon Sanctuary"],
  "kikusui-ji": ["Kikusui-ji", "Chichibu 34 Kannon Sanctuary"],
  "ganden-ji": ["Ganden-ji", "Band\u014d Sanj\u016bsankasho"],
  "anyo-in": ["An'y\u014d-in", "Anyo-in", "Band\u014d Sanj\u016bsankasho"],
  "hase-dera-kamakura": ["Hase-dera", "Band\u014d Sanj\u016bsankasho"],
  "chokoku-ji-atsugi": ["Ch\u014dkoku-ji", "Chokoku-ji", "Band\u014d Sanj\u016bsankasho"],
  "komyo-ji": ["K\u014dmy\u014d-ji", "Komyo-ji", "Band\u014d Sanj\u016bsankasho"],
  "shokoku-ji": ["Sh\u014dkoku-ji", "Shokoku-ji", "Band\u014d Sanj\u016bsankasho"],
  "shobo-ji": ["Sh\u014db\u014d-ji", "Shobo-ji", "Band\u014d Sanj\u016bsankasho"],
  "bando-anraku-ji-11": ["Anraku-ji", "Band\u014d Sanj\u016bsankasho"],
  "jion-ji": ["Jion-ji", "Band\u014d Sanj\u016bsankasho"],
  "gumyo-ji": ["Gumy\u014d-ji", "Gumyo-ji", "Band\u014d Sanj\u016bsankasho"],
  "chokoku-ji-gunma": ["Ch\u014dkoku-ji", "Chokoku-ji", "Band\u014d Sanj\u016bsankasho"],
  "mizusawa-dera": ["Mizusawa-dera", "Band\u014d Sanj\u016bsankasho"],
  "chuzen-ji": ["Ch\u016bzen-ji", "Chuzen-ji", "Band\u014d Sanj\u016bsankasho"],
  "oya-ji": ["\u014cya-ji", "Band\u014d Sanj\u016bsankasho"],
  "saimyo-ji": ["Saimy\u014d-ji", "Saimyo-ji", "Band\u014d Sanj\u016bsankasho"],
  "satake-ji": ["Satake-ji", "Band\u014d Sanj\u016bsankasho"],
  "kanzeon-ji-ibaraki": ["Kanzeon-ji", "Band\u014d Sanj\u016bsankasho"],
  "rakuho-ji": ["Rakuh\u014d-ji", "Rakuho-ji", "Band\u014d Sanj\u016bsankasho"],
  "bando-kiyotaki-ji-26": ["Kiyotaki-ji", "Band\u014d Sanj\u016bsankasho"],
  "enpuku-ji": ["Enpuku-ji", "Band\u014d Sanj\u016bsankasho"],
  "ryusho-in": ["Ryush\u014d-in", "Ryusho-in", "Band\u014d Sanj\u016bsankasho"],
  "kozo-ji": ["K\u014dz\u014d-ji", "Kozo-ji", "Band\u014d Sanj\u016bsankasho"],
  "kasamori-ji": ["Kasamori-ji", "Band\u014d Sanj\u016bsankasho"],
  "kiyomizu-dera-chiba": ["Kiyomizu-dera", "Band\u014d Sanj\u016bsankasho"],
  "devdaha": ["Devdaha", "Devadaha"],
  "ramgram": ["Ramagrama stupa", "Ramgram"],
  "kopan": ["Kopan Monastery"],
  "pharping": ["Pharping", "Asura Cave"],
  "kesariya": ["Kesaria stupa", "Kesariya"],
  "pragbodhi": ["Dungeshwari Cave Temples", "Pragbodhi"],
  "barabar-caves": ["Barabar Caves"],
  "tawang": ["Tawang Monastery"],
  "bomdila": ["Bomdila"],
  "muktinath": ["Muktinath"],
  "yamunotri": ["Yamunotri"],
  "gangotri": ["Gangotri"],
  "ayodhya": ["Ayodhya", "Ram Mandir"],
  "kanchipuram": ["Kanchipuram", "Ekambareswarar Temple"],
  "ujjain": ["Ujjain", "Mahakaleshwar Temple"],
  "somnath": ["Somnath temple"],
  "mallikarjuna": ["Mallikarjuna Temple, Srisailam"],
  "mahakaleshwar": ["Mahakaleshwar Temple"],
  "omkareshwar": ["Omkareshwar Temple"],
  "bhimashankar": ["Bhimashankar Temple"],
  "trimbakeshwar": ["Trimbakeshwar Shiva Temple"],
  "vaidyanath": ["Baidyanath Temple, Deoghar", "Baba Baidyanath"],
  "nageshwar": ["Nageshwar Jyotirlinga"],
  "grishneshwar": ["Grishneshwar Temple"],
  "kamakhya": ["Kamakhya Temple"],
  "kalighat": ["Kalighat Kali Temple"],
  "tara-tarini": ["Tara Tarini Temple"],
  "bimala": ["Vimala Temple", "Jagannath Temple, Puri"],
  "ekambareswarar": ["Ekambareswarar Temple"],
  "jambukeswarar": ["Jambukeswarar Temple, Thiruvanaikaval"],
  "arunachaleswarar": ["Arunachalesvara Temple"],
  "srikalahasti": ["Srikalahasti Temple"],
  "chidambaram": ["Nataraja Temple, Chidambaram"],
  "morgaon": ["Ganesha Temple, Morgaon", "Morgaon"],
  "siddhatek": ["Siddhivinayak Temple, Siddhatek", "Siddhatek"],
  "ballaleshwar-pali": ["Ballaleshwar Pali"],
  "varadvinayak": ["Varadvinayak Temple", "Mahad"],
  "theur": ["Chintamani Temple, Theur"],
  "lenyadri": ["Lenyadri"],
  "ozar": ["Vighnahar Temple, Ozar", "Ozar"],
  "ranjangaon": ["Mahaganapati Temple, Ranjangaon", "Ranjangaon"],
  "tungnath": ["Tungnath"],
  "rudranath": ["Rudranath"],
  "madhyamaheshwar": ["Madhyamaheshwar"],
  "kalpeshwar": ["Kalpeshwar"],
  "vishnuprayag": ["Vishnuprayag"],
  "nandprayag": ["Nandaprayag"],
  "karnaprayag": ["Karnaprayag"],
  "rudraprayag": ["Rudraprayag"],
  "devprayag": ["Devprayag"],
  "prayagraj": ["Triveni Sangam", "Prayagraj"],
  "panchavati": ["Panchavati", "Nashik"],
  "chitrakoot": ["Chitrakoot"],
  "vrindavan": ["Vrindavan"],
  "govardhan": ["Govardhan Hill"],
  "barsana": ["Barsana"],
  "gokul": ["Gokul"],
  "kurukshetra": ["Kurukshetra"],
  "amarkantak": ["Amarkantak"],
  "maheshwar": ["Maheshwar"],
  "bharuch": ["Bharuch"],
  "manimahesh": ["Manimahesh Lake"],
  "vaishno-devi": ["Vaishno Devi Temple"],
  "eight-great-places": ["Buddhist pilgrimage sites", "Bodh Gaya"],
  "buddhas-walk": ["Mahabodhi Temple", "Sarnath"],
  "sapta-puri": ["Ayodhya", "Varanasi"],
  "jyotirlinga-12": ["Jyotirlinga", "Somnath temple"],
  "adi-shakti-peethas": ["Kamakhya Temple", "Kalighat Kali Temple"],
  "pancha-bhoota": ["Pancha Bhuta Sthalam", "Arunachalesvara Temple"],
  "ashta-vinayak": ["Ashtavinayaka", "Morgaon"],
  "panch-kedar": ["Panch Kedar", "Kedarnath Temple"],
  "panch-prayag": ["Panch Prayag", "Devprayag"],
  "kumbh-cities": ["Kumbh Mela", "Prayagraj"],
  "rama-circuit": ["Ayodhya", "Rameswaram"],
  "braj-krishna": ["Vrindavan", "Mathura"],
  "govardhan-parikrama": ["Govardhan Hill", "Vrindavan"],
  "narmada-parikrama": ["Narmada River", "Amarkantak"],
  "manimahesh-yatra": ["Manimahesh Lake"],
  "divya-desam-highlights": ["Divya Desam", "Tirupati"],
  "arunachal-buddhist": ["Tawang Monastery"],
};

/** Extra Commons search queries when Wikipedia pageimages miss. */
const COMMONS_QUERIES: Record<string, string[]> = {
  lumbini: ["Lumbini Maya Devi", "Lumbini Nepal"],
  "bodh-gaya": ["Mahabodhi Temple Bodh Gaya"],
  "kyoto-kinkaku": ["Kinkakuji Kyoto", "Golden Pavilion Kyoto"],
  "plum-village": ["Plum Village Thich Nhat Hanh"],
  "shikoku-88": ["Shikoku henro pilgrimage", "Shikoku 88 temples"],
  "saigoku-kannon": ["Saigoku pilgrimage Kannon"],
  "china-four-mountains": ["Mount Wutai temple", "Wutai Shan"],
  "four-great-sites": ["Mahabodhi Temple", "Lumbini"],
  "buddhist-circuit-india": ["Buddhist circuit India", "Bodh Gaya pilgrims"],
  "ryozen-ji": ["Ryozenji Tokushima", "Ryōzen-ji temple"],
  "shosan-ji": ["Shosanji Tokushima", "焼山寺"],
  "hotsumisaki-ji": ["Hotsumisakiji Muroto", "最御崎寺"],
  "kongofuku-ji": ["Kongofukuji Ashizuri", "金剛福寺"],
  "ishite-ji": ["Ishiteji Matsuyama", "石手寺"],
  "zentsu-ji": ["Zentsuji Kagawa", "善通寺"],
  "okubo-ji": ["Okuboji Kagawa", "大窪寺"],
  "seiganto-ji": ["Seigantoji Nachi", "青岸渡寺"],
  "kiyomizu-dera": ["Kiyomizudera Kyoto", "清水寺"],
  "kumano-hongu": ["Kumano Hongu Taisha", "熊野本宮大社"],
  "kumano-nachi": ["Kumano Nachi Taisha waterfall", "熊野那智大社"],
  "lake-manasarovar": ["Manasarovar Tibet", "Mapam Yumco"],
  "emei-shan": ["Mount Emei Golden Summit", "峨眉山"],
  "jiuhua-shan": ["Jiuhua Shan temple", "九华山"],
  "sri-pada": ["Adams Peak Sri Lanka pilgrims", "Sri Pada"],
  swayambhunath: ["Swayambhunath stupa Kathmandu"],
  boudhanath: ["Boudhanath stupa"],
  bagan: ["Bagan Myanmar temples sunrise"],
  mahamuni: ["Mahamuni Buddha Mandalay"],
  potala: ["Potala Palace Lhasa"],
  "mount-haguro": ["Mount Haguro stairs", "羽黒山"],
  "dewa-sanzan": ["Dewa Sanzan Haguro", "出羽三山"],
  "kumano-kodo": ["Kumano Kodo trail", "熊野古道"],
  shimabuji: ["Chichibu temple Kannon", "四萬部寺"],
  suisenji: ["Suisenji Chichibu", "水潜寺"],
  "sugimoto-dera": ["Sugimotodera Kamakura", "杉本寺"],
  "senso-ji": ["Sensoji Asakusa", "浅草寺"],
  "nago-ji": ["Nagoji Tateyama", "那古寺"],
  "jison-in": ["Jisonin Kudoyama", "慈尊院"],
  tongdosa: ["Tongdosa temple Korea", "통도사"],
  haeinsa: ["Haeinsa Tripitaka", "해인사"],
  songgwangsa: ["Songgwangsa temple", "송광사"],
  ayutthaya: ["Ayutthaya Wat Mahathat", "Ayutthaya Buddha head"],
  sukhothai: ["Sukhothai Wat Mahathat"],
  "doi-suthep": ["Doi Suthep Chiang Mai", "วัดพระธาตุดอยสุเทพ"],
  "chichibu-34": ["Chichibu pilgrimage Kannon"],
  "bando-33": ["Sugimotodera Kamakura"],
  "choishi-michi": ["Choishimichi Koyasan", "町石道"],
  "korea-three-jewels": ["Haeinsa Korea monastery"],
  "thailand-historic-capitals": ["Doi Suthep golden chedi"],
  "batu-caves": ["Batu Caves Murugan", "Batu Caves Kuala Lumpur"],
  ganden: ["Ganden Monastery Tibet", "Ganden Namgyaling"],
  hemis: ["Hemis Monastery Ladakh", "Hemis Gompa"],
  "erdene-zuu": ["Erdene Zuu Monastery", "Erdene Zuu Karakorum"],
  gandan: ["Gandantegchinlen", "Gandan Monastery Ulaanbaatar"],
  theur: ["Chintamani Theur", "Theur Ganesh temple"],
  lenyadri: ["Lenyadri caves", "Girijatmaj Lenyadri"],
  ozar: ["Ozar Ganesh", "Vighnahar Ozar"],
  ranjangaon: ["Ranjangaon Ganpati", "Mahaganapati Ranjangaon"],
  tungnath: ["Tungnath temple", "Tungnath Chopta"],
  rudranath: ["Rudranath temple Garhwal"],
  madhyamaheshwar: ["Madhyamaheshwar temple"],
  kalpeshwar: ["Kalpeshwar temple"],
  nandprayag: ["Nandprayag confluence", "Nandaprayag"],
  karnaprayag: ["Karnaprayag confluence"],
  rudraprayag: ["Rudraprayag confluence"],
  devprayag: ["Devprayag confluence Ganga"],
  panchavati: ["Panchavati Nashik", "Ramkund Nashik"],
  chitrakoot: ["Chitrakoot temple", "Kamadgiri Chitrakoot"],
  vrindavan: ["Vrindavan temple", "Banke Bihari Vrindavan"],
  govardhan: ["Govardhan Hill", "Giriraj Govardhan"],
  barsana: ["Barsana Radha Rani", "Barsana temple"],
  kurukshetra: ["Kurukshetra Brahma Sarovar", "Jyotisar"],
  amarkantak: ["Amarkantak Narmada kund", "Amarkantak temple"],
  maheshwar: ["Maheshwar fort ghats", "Maheshwar Narmada"],
  bharuch: ["Bharuch Narmada", "Bharuch city"],
  manimahesh: ["Manimahesh Lake Chamba", "Manimahesh Kailash"],
  "vaishno-devi": ["Vaishno Devi Bhawan", "Vaishno Devi trek"],
};

type Target = {
  slug: string;
  name: string;
  kind: "site" | "route";
  country?: string;
  fallbackSlugs?: string[];
};

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function isLikelyPhotoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes(".svg/")) return false;
  if (lower.includes(".pdf") || lower.includes(".gif")) return false;
  if (lower.includes("icon") || lower.includes("logo")) return false;
  return true;
}

async function fromWikipediaTitles(
  titles: string[],
): Promise<{ url: string; source: string } | null> {
  for (const title of titles) {
    const apiUrl = `${WP_API}?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=960&format=json`;
    const data = await fetchJson<{
      query?: {
        pages?: Record<
          string,
          { missing?: boolean; thumbnail?: { source?: string } }
        >;
      };
    }>(apiUrl);
    const pages = data?.query?.pages;
    if (!pages) continue;
    for (const page of Object.values(pages)) {
      if (page.missing) continue;
      const thumb = page.thumbnail?.source;
      if (!thumb || !isLikelyPhotoUrl(thumb)) continue;
      const url = normalizeWikimediaThumb(thumb, 960);
      const ok = await verifyImageUrl(url);
      if (ok) return { url, source: "wikipedia" };
    }
  }
  return null;
}

async function fromCommonsQueries(
  queries: string[],
): Promise<{ url: string; source: string } | null> {
  for (const query of queries) {
    const apiUrl = `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=960&format=json`;
    const data = await fetchJson<{
      query?: {
        pages?: Record<
          string,
          {
            title?: string;
            imageinfo?: { thumburl?: string; url?: string; mime?: string }[];
          }
        >;
      };
    }>(apiUrl);
    const pages = data?.query?.pages;
    if (!pages) continue;
    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0];
      if (!info?.mime?.startsWith("image/") || info.mime.includes("svg")) {
        continue;
      }
      const thumb = info.thumburl ?? info.url;
      if (!thumb || !isLikelyPhotoUrl(thumb)) continue;
      const ok = await verifyImageUrl(thumb);
      if (ok) return { url: thumb, source: "wikimedia" };
    }
  }
  return null;
}

async function findPilgrimageImage(
  target: Target,
): Promise<{ url: string; source: string } | null> {
  const titles = WIKIPEDIA_TITLES[target.slug] ?? [target.name];
  const wiki = await fromWikipediaTitles(titles);
  if (wiki) return wiki;

  const commonsQueries =
    COMMONS_QUERIES[target.slug] ??
    [target.name, `${target.name} ${target.country ?? ""}`.trim()];
  const commons = await fromCommonsQueries(commonsQueries);
  if (commons) return commons;

  if (target.kind === "site") {
    return findVenueImage({
      name: target.name,
      type: "Temple",
    });
  }

  return null;
}

function extFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.(jpe?g|png|webp)(?:$|\?)/);
    if (match) return `.${match[1].replace("jpeg", "jpg")}`;
  } catch {
    /* ignore */
  }
  return null;
}

function extFromContentType(contentType: string): string {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return EXT_BY_TYPE[base] ?? ".jpg";
}

async function downloadImage(
  url: string,
  destBase: string,
): Promise<{ path: string; bytes: number } | null> {
  await new Promise((r) => setTimeout(r, 300));

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/") || contentType.includes("svg")) {
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 2000) return null;

  const ext = extFromUrl(url) ?? extFromContentType(contentType);
  const fullPath = `${destBase}${ext}`;
  if (!DRY_RUN) writeFileSync(fullPath, buffer);

  return { path: fullPath, bytes: buffer.length };
}

function existingLocalPath(slug: string): string | null {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const abs = join(OUTPUT_DIR, `${slug}${ext}`);
    if (existsSync(abs)) return `/pilgrimage/${slug}${ext}`;
  }
  return null;
}

async function main() {
  if (!existsSync(OUTPUT_DIR) && !DRY_RUN) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const siteTargets: Target[] = PILGRIMAGE_SITES.map((site) => ({
    slug: site.slug,
    name: site.name,
    kind: "site",
    country: site.country,
  }));

  const routeTargets: Target[] = PILGRIMAGE_ROUTES.map((route) => ({
    slug: route.slug,
    name: route.name,
    kind: "route",
    fallbackSlugs: route.stopSlugs,
  }));

  let targets = [...siteTargets, ...routeTargets];
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);

  console.log(
    `\n🖼  Pilgrimage photos: ${targets.length} to process${DRY_RUN ? " [dry-run]" : ""}${FORCE ? " [force]" : ""}\n`,
  );

  const manifest: Record<string, string> = {};
  let downloaded = 0;
  let reused = 0;
  let fallback = 0;
  let missed = 0;

  // Prefer sites first so routes can reuse stop images.
  for (const target of targets) {
    const existing = existingLocalPath(target.slug);
    if (existing && !FORCE) {
      manifest[target.slug] = existing;
      reused++;
      console.log(`  ✓ ${target.slug} (existing)`);
      continue;
    }

    const found = await findPilgrimageImage(target);
    if (found) {
      const destBase = join(OUTPUT_DIR, target.slug);
      const result = await downloadImage(found.url, destBase);
      if (result) {
        const localPath = `/pilgrimage/${target.slug}${result.path.slice(result.path.lastIndexOf("."))}`;
        manifest[target.slug] = localPath;
        downloaded++;
        console.log(
          `  💾 ${target.slug} ← ${found.source} (${Math.round(result.bytes / 1024)} KB)`,
        );
        continue;
      }
    }

    // Routes: copy first available stop image.
    if (target.kind === "route" && target.fallbackSlugs) {
      for (const stopSlug of target.fallbackSlugs) {
        const stopPath = manifest[stopSlug] ?? existingLocalPath(stopSlug);
        if (!stopPath) continue;
        const srcAbs = join(ROOT, "public", stopPath.slice(1));
        const ext = stopPath.slice(stopPath.lastIndexOf("."));
        const destRel = `/pilgrimage/${target.slug}${ext}`;
        const destAbs = join(ROOT, "public", destRel.slice(1));
        if (!DRY_RUN && existsSync(srcAbs)) {
          copyFileSync(srcAbs, destAbs);
        }
        manifest[target.slug] = destRel;
        fallback++;
        console.log(`  ↪ ${target.slug} ← stop ${stopSlug}`);
        break;
      }
    }

    if (!manifest[target.slug]) {
      missed++;
      console.log(`  ✗ ${target.slug} — no image found`);
    }
  }

  // Fill any remaining route gaps after all sites are done.
  for (const route of PILGRIMAGE_ROUTES) {
    if (manifest[route.slug]) continue;
    for (const stopSlug of route.stopSlugs) {
      const stopPath = manifest[stopSlug] ?? existingLocalPath(stopSlug);
      if (!stopPath) continue;
      const srcAbs = join(ROOT, "public", stopPath.slice(1));
      const ext = stopPath.slice(stopPath.lastIndexOf("."));
      const destRel = `/pilgrimage/${route.slug}${ext}`;
      const destAbs = join(ROOT, "public", destRel.slice(1));
      if (!DRY_RUN && existsSync(srcAbs)) {
        copyFileSync(srcAbs, destAbs);
      }
      manifest[route.slug] = destRel;
      fallback++;
      missed = Math.max(0, missed - 1);
      console.log(`  ↪ ${route.slug} ← stop ${stopSlug} (late)`);
      break;
    }
  }

  // Merge any previously downloaded files not in this run.
  if (!FORCE) {
    for (const target of [...siteTargets, ...routeTargets]) {
      if (manifest[target.slug]) continue;
      const existing = existingLocalPath(target.slug);
      if (existing) manifest[target.slug] = existing;
    }
  }

  if (!DRY_RUN) {
    const ordered: Record<string, string> = {};
    for (const target of [...siteTargets, ...routeTargets]) {
      if (manifest[target.slug]) ordered[target.slug] = manifest[target.slug];
    }
    writeFileSync(MANIFEST_PATH, `${JSON.stringify(ordered, null, 2)}\n`);
  }

  console.log(
    `\nDone. downloaded=${downloaded} reused=${reused} fallback=${fallback} missed=${missed}`,
  );
  console.log(`Manifest → ${MANIFEST_PATH}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
