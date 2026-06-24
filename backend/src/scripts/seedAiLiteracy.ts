/**
 * Seed script for the AI Literacy module.
 *
 * Inserts 3 levels, each with 2 readings + 1 quiz + 1 task
 * (6 readings, 3 tasks, 15 quiz questions total), all bilingual (EN/हिंदी).
 *
 * Run manually (NOT part of the running server):
 *   npm run seed:ai-literacy            # seeds only if the module is empty
 *   npm run seed:ai-literacy -- --force # wipes existing AI Literacy data first
 *
 * Writes to the real `is_published` column. Does NOT touch students, careers,
 * interest_responses, or any other existing table.
 */
import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

type ContentType = "reading" | "quiz" | "task";
type CorrectAnswer = "A" | "B" | "C" | "D";

interface SeedQuestion {
  question_text: string;
  question_text_hi: string;
  option_a: string;
  option_a_hi: string;
  option_b: string;
  option_b_hi: string;
  option_c: string;
  option_c_hi: string;
  option_d: string;
  option_d_hi: string;
  correct_answer: CorrectAnswer;
  explanation: string;
  explanation_hi: string;
}

interface SeedContent {
  type: ContentType;
  title: string;
  title_hi: string;
  body?: string;
  body_hi?: string;
  questions?: SeedQuestion[];
}

interface SeedLevel {
  level_number: number;
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  content: SeedContent[];
}

const LEVELS: SeedLevel[] = [
  // ============================================================
  // LEVEL 1 — Foundations of AI
  // ============================================================
  {
    level_number: 1,
    title: "Foundations of AI",
    title_hi: "एआई की नींव",
    description:
      "Start here. Learn what artificial intelligence really is and where you already meet it every day.",
    description_hi:
      "यहाँ से शुरू करें। जानें कि आर्टिफ़िशियल इंटेलिजेंस असल में क्या है और आप इसे रोज़ कहाँ देखते हैं।",
    content: [
      {
        type: "reading",
        title: "What is Artificial Intelligence?",
        title_hi: "आर्टिफ़िशियल इंटेलिजेंस क्या है?",
        body:
          "Artificial Intelligence, or AI, is when a computer is built to do things that normally need human thinking — like recognising a face, understanding language, or making a choice.\n\nA normal program follows fixed rules written by a person. AI is different: it can look at lots of examples and find patterns on its own. For example, after seeing thousands of photos of cats, an AI can learn to spot a cat in a new photo it has never seen before.\n\nAI is not magic and it is not alive. It does not 'understand' the world the way you do. It is a very fast pattern-finder that works with numbers and data. Knowing this helps you use AI wisely.",
        body_hi:
          "आर्टिफ़िशियल इंटेलिजेंस, यानी एआई, तब होता है जब किसी कंप्यूटर को ऐसे काम करने के लिए बनाया जाता है जिनके लिए आमतौर पर इंसानी सोच की ज़रूरत होती है — जैसे चेहरा पहचानना, भाषा समझना, या कोई चुनाव करना।\n\nएक सामान्य प्रोग्राम इंसान द्वारा लिखे तय नियमों का पालन करता है। एआई अलग है: यह बहुत सारे उदाहरण देखकर खुद पैटर्न ढूँढ सकता है। उदाहरण के लिए, हज़ारों बिल्लियों की तस्वीरें देखने के बाद एआई किसी नई तस्वीर में भी बिल्ली पहचानना सीख सकता है।\n\nएआई कोई जादू नहीं है और न ही यह जीवित है। यह दुनिया को वैसे नहीं 'समझता' जैसे आप समझते हैं। यह संख्याओं और डेटा के साथ काम करने वाला एक बहुत तेज़ पैटर्न खोजने वाला है। यह जानना आपको एआई का समझदारी से उपयोग करने में मदद करता है।",
      },
      {
        type: "reading",
        title: "AI in Your Everyday Life",
        title_hi: "आपके रोज़मर्रा जीवन में एआई",
        body:
          "You probably use AI many times a day without noticing.\n\nWhen YouTube suggests the next video, when your phone unlocks by looking at your face, when a keyboard predicts the next word you want to type, when Google Maps finds the fastest route, or when a voice assistant answers a question — that is all AI at work.\n\nEach of these tools learned from huge amounts of data: videos people watched, faces, sentences, traffic, and recordings of speech. The more good data they see, the better they get. Spotting AI around you is the first step to understanding it.",
        body_hi:
          "आप शायद दिन में कई बार बिना ध्यान दिए एआई का उपयोग करते हैं।\n\nजब YouTube अगला वीडियो सुझाता है, जब आपका फ़ोन आपका चेहरा देखकर खुलता है, जब कीबोर्ड आपके अगले शब्द का अनुमान लगाता है, जब Google Maps सबसे तेज़ रास्ता ढूँढता है, या जब कोई वॉइस असिस्टेंट सवाल का जवाब देता है — यह सब एआई का काम है।\n\nइनमें से हर टूल ने बहुत सारे डेटा से सीखा है: लोगों द्वारा देखे गए वीडियो, चेहरे, वाक्य, ट्रैफ़िक और आवाज़ की रिकॉर्डिंग। वे जितना अच्छा डेटा देखते हैं, उतने बेहतर होते जाते हैं। अपने आस-पास एआई को पहचानना उसे समझने का पहला कदम है।",
      },
      {
        type: "quiz",
        title: "Check: AI Basics",
        title_hi: "जाँच: एआई की मूल बातें",
        questions: [
          {
            question_text: "What makes AI different from a normal computer program?",
            question_text_hi:
              "एआई को सामान्य कंप्यूटर प्रोग्राम से अलग क्या बनाता है?",
            option_a: "It can learn patterns from examples",
            option_a_hi: "यह उदाहरणों से पैटर्न सीख सकता है",
            option_b: "It never makes mistakes",
            option_b_hi: "यह कभी गलती नहीं करता",
            option_c: "It is alive and thinks like a human",
            option_c_hi: "यह जीवित है और इंसान की तरह सोचता है",
            option_d: "It does not need electricity",
            option_d_hi: "इसे बिजली की ज़रूरत नहीं होती",
            correct_answer: "A",
            explanation:
              "AI learns patterns from data and examples, instead of only following fixed rules.",
            explanation_hi:
              "एआई केवल तय नियमों का पालन करने के बजाय डेटा और उदाहरणों से पैटर्न सीखता है।",
          },
          {
            question_text: "Which of these is an example of AI?",
            question_text_hi: "इनमें से कौन-सा एआई का उदाहरण है?",
            option_a: "A calculator adding two numbers",
            option_a_hi: "दो संख्याएँ जोड़ता हुआ कैलकुलेटर",
            option_b: "A face-unlock feature on a phone",
            option_b_hi: "फ़ोन पर फ़ेस-अनलॉक सुविधा",
            option_c: "A light switch turning on a bulb",
            option_c_hi: "बल्ब जलाता हुआ लाइट स्विच",
            option_d: "A clock showing the time",
            option_d_hi: "समय दिखाती हुई घड़ी",
            correct_answer: "B",
            explanation:
              "Face unlock learned to recognise faces from many examples — that is AI. The others follow simple fixed rules.",
            explanation_hi:
              "फ़ेस अनलॉक ने कई उदाहरणों से चेहरे पहचानना सीखा है — यह एआई है। बाकी सरल तय नियमों पर चलते हैं।",
          },
          {
            question_text: "How does an AI usually learn to recognise a cat?",
            question_text_hi: "एआई आमतौर पर बिल्ली पहचानना कैसे सीखता है?",
            option_a: "Someone writes a rule for every cat",
            option_a_hi: "कोई हर बिल्ली के लिए एक नियम लिखता है",
            option_b: "It guesses randomly every time",
            option_b_hi: "यह हर बार अंदाज़े से जवाब देता है",
            option_c: "By looking at many example photos of cats",
            option_c_hi: "बिल्लियों की कई उदाहरण तस्वीरें देखकर",
            option_d: "By asking the cat its name",
            option_d_hi: "बिल्ली से उसका नाम पूछकर",
            correct_answer: "C",
            explanation:
              "AI studies many labelled examples and finds the common patterns that make a cat a cat.",
            explanation_hi:
              "एआई कई लेबल किए गए उदाहरण देखता है और वे साझा पैटर्न ढूँढता है जो बिल्ली को बिल्ली बनाते हैं।",
          },
          {
            question_text: "Which statement about AI is TRUE?",
            question_text_hi: "एआई के बारे में कौन-सा कथन सही है?",
            option_a: "AI understands the world exactly like humans",
            option_a_hi: "एआई दुनिया को बिल्कुल इंसानों की तरह समझता है",
            option_b: "AI is a fast pattern-finder using data",
            option_b_hi: "एआई डेटा का उपयोग करने वाला तेज़ पैटर्न-खोजी है",
            option_c: "AI has feelings and opinions",
            option_c_hi: "एआई की भावनाएँ और राय होती हैं",
            option_d: "AI works without any data",
            option_d_hi: "एआई बिना किसी डेटा के काम करता है",
            correct_answer: "B",
            explanation:
              "AI is essentially a very fast pattern-finder that works with data — it has no feelings or true understanding.",
            explanation_hi:
              "एआई असल में डेटा के साथ काम करने वाला बहुत तेज़ पैटर्न-खोजी है — इसकी कोई भावना या सच्ची समझ नहीं होती।",
          },
          {
            question_text:
              "When Google Maps finds the fastest route, what is it mostly using?",
            question_text_hi:
              "जब Google Maps सबसे तेज़ रास्ता ढूँढता है, तो वह मुख्य रूप से क्या उपयोग करता है?",
            option_a: "Magic",
            option_a_hi: "जादू",
            option_b: "A printed map book",
            option_b_hi: "छपी हुई नक्शे की किताब",
            option_c: "Data about roads and traffic",
            option_c_hi: "सड़कों और ट्रैफ़िक का डेटा",
            option_d: "A random guess",
            option_d_hi: "एक अंदाज़ा",
            correct_answer: "C",
            explanation:
              "Maps uses real data about roads and current traffic to predict the fastest route.",
            explanation_hi:
              "Maps सबसे तेज़ रास्ते का अनुमान लगाने के लिए सड़कों और मौजूदा ट्रैफ़िक के असली डेटा का उपयोग करता है।",
          },
        ],
      },
      {
        type: "task",
        title: "Spot the AI Around You",
        title_hi: "अपने आस-पास एआई पहचानें",
        body:
          "For one full day, keep a small list of every time you think AI helped you — video suggestions, autocomplete, face unlock, voice assistants, photo filters, and so on.\n\nWrite down at least 5 examples. For each one, note what data you think it learned from. Bring your list to class and compare with a friend.",
        body_hi:
          "पूरे एक दिन के लिए, हर उस मौके की एक छोटी सूची बनाएँ जब आपको लगे कि एआई ने आपकी मदद की — वीडियो सुझाव, ऑटोकम्प्लीट, फ़ेस अनलॉक, वॉइस असिस्टेंट, फ़ोटो फ़िल्टर, इत्यादि।\n\nकम से कम 5 उदाहरण लिखें। हर एक के लिए नोट करें कि आपको लगता है उसने किस डेटा से सीखा होगा। अपनी सूची कक्षा में लाएँ और किसी दोस्त से तुलना करें।",
      },
    ],
  },

  // ============================================================
  // LEVEL 2 — How AI Learns
  // ============================================================
  {
    level_number: 2,
    title: "How AI Learns",
    title_hi: "एआई कैसे सीखता है",
    description:
      "Go deeper. See how data, training, and patterns let machines make predictions.",
    description_hi:
      "और गहराई में जाएँ। देखें कि डेटा, ट्रेनिंग और पैटर्न मशीनों को भविष्यवाणी करने में कैसे सक्षम बनाते हैं।",
    content: [
      {
        type: "reading",
        title: "Data: The Food of AI",
        title_hi: "डेटा: एआई का भोजन",
        body:
          "AI learns from data. Data can be photos, text, numbers, sounds, or videos — anything that can be stored as information.\n\nThink of data like food for the AI. If you feed it lots of good, varied, and correct examples, it grows strong and makes good decisions. If you feed it very little data, or data that is wrong or unfair, it learns bad habits.\n\nThis is why people who build AI care so much about collecting clean, fair data. 'Garbage in, garbage out' — bad data leads to bad results.",
        body_hi:
          "एआई डेटा से सीखता है। डेटा तस्वीरें, टेक्स्ट, संख्याएँ, ध्वनियाँ या वीडियो हो सकता है — कुछ भी जो जानकारी के रूप में संग्रहीत किया जा सके।\n\nडेटा को एआई के भोजन की तरह सोचें। अगर आप उसे ढेर सारे अच्छे, विविध और सही उदाहरण देते हैं, तो वह मज़बूत बनता है और अच्छे निर्णय लेता है। अगर आप उसे बहुत कम डेटा, या गलत या अनुचित डेटा देते हैं, तो वह बुरी आदतें सीखता है।\n\nइसीलिए एआई बनाने वाले लोग साफ़ और निष्पक्ष डेटा इकट्ठा करने का बहुत ध्यान रखते हैं। 'कचरा अंदर, कचरा बाहर' — खराब डेटा से खराब नतीजे मिलते हैं।",
      },
      {
        type: "reading",
        title: "Training, Patterns, and Predictions",
        title_hi: "ट्रेनिंग, पैटर्न और भविष्यवाणियाँ",
        body:
          "Teaching an AI is called 'training'. During training, the AI sees example after example and slowly adjusts itself to get better at the task.\n\nFor instance, to predict tomorrow's weather, an AI studies years of past weather data and finds patterns — like 'dark clouds and high humidity often come before rain'. Then, when it sees today's conditions, it makes a prediction.\n\nA prediction is a smart guess based on patterns, not a certain fact. That is why AI can be very useful but is sometimes wrong.",
        body_hi:
          "एआई को सिखाने को 'ट्रेनिंग' कहते हैं। ट्रेनिंग के दौरान एआई एक के बाद एक उदाहरण देखता है और धीरे-धीरे खुद को बेहतर बनाता जाता है।\n\nउदाहरण के लिए, कल के मौसम की भविष्यवाणी करने के लिए एआई वर्षों के पुराने मौसम डेटा का अध्ययन करता है और पैटर्न ढूँढता है — जैसे 'काले बादल और अधिक नमी अक्सर बारिश से पहले आते हैं'। फिर, जब वह आज की स्थिति देखता है, तो भविष्यवाणी करता है।\n\nभविष्यवाणी पैटर्न पर आधारित एक समझदार अंदाज़ा है, कोई पक्का तथ्य नहीं। इसीलिए एआई बहुत उपयोगी हो सकता है पर कभी-कभी गलत भी होता है।",
      },
      {
        type: "quiz",
        title: "Check: How AI Learns",
        title_hi: "जाँच: एआई कैसे सीखता है",
        questions: [
          {
            question_text: "What does an AI mainly learn from?",
            question_text_hi: "एआई मुख्य रूप से किससे सीखता है?",
            option_a: "Data such as photos, text, and numbers",
            option_a_hi: "डेटा जैसे तस्वीरें, टेक्स्ट और संख्याएँ",
            option_b: "Its own imagination",
            option_b_hi: "अपनी कल्पना से",
            option_c: "The phase of the moon",
            option_c_hi: "चंद्रमा की कला से",
            option_d: "Nothing at all",
            option_d_hi: "किसी चीज़ से नहीं",
            correct_answer: "A",
            explanation:
              "AI learns from data — examples like photos, text, sounds, and numbers.",
            explanation_hi:
              "एआई डेटा से सीखता है — तस्वीरों, टेक्स्ट, ध्वनियों और संख्याओं जैसे उदाहरणों से।",
          },
          {
            question_text: "What does 'garbage in, garbage out' mean for AI?",
            question_text_hi: "एआई के लिए 'कचरा अंदर, कचरा बाहर' का क्या मतलब है?",
            option_a: "AI should be kept in a dustbin",
            option_a_hi: "एआई को कूड़ेदान में रखना चाहिए",
            option_b: "Bad data leads to bad results",
            option_b_hi: "खराब डेटा से खराब नतीजे मिलते हैं",
            option_c: "AI only works at night",
            option_c_hi: "एआई केवल रात में काम करता है",
            option_d: "More data is always useless",
            option_d_hi: "अधिक डेटा हमेशा बेकार होता है",
            correct_answer: "B",
            explanation:
              "If the training data is wrong or unfair, the AI's results will also be poor.",
            explanation_hi:
              "अगर ट्रेनिंग डेटा गलत या अनुचित है, तो एआई के नतीजे भी खराब होंगे।",
          },
          {
            question_text: "What is 'training' an AI?",
            question_text_hi: "एआई को 'ट्रेनिंग' देना क्या है?",
            option_a: "Making it run on a treadmill",
            option_a_hi: "उसे ट्रेडमिल पर दौड़ाना",
            option_b: "Showing it examples so it gets better at a task",
            option_b_hi: "उसे उदाहरण दिखाना ताकि वह किसी काम में बेहतर हो",
            option_c: "Turning it off and on",
            option_c_hi: "उसे बंद और चालू करना",
            option_d: "Painting it a new colour",
            option_d_hi: "उसे नया रंग देना",
            correct_answer: "B",
            explanation:
              "Training means the AI sees many examples and adjusts itself to improve at the task.",
            explanation_hi:
              "ट्रेनिंग का मतलब है एआई कई उदाहरण देखकर खुद को सुधारता है ताकि वह काम में बेहतर हो।",
          },
          {
            question_text: "An AI weather forecast is best described as a…",
            question_text_hi:
              "एआई के मौसम पूर्वानुमान को सबसे अच्छा किस रूप में बताया जा सकता है…",
            option_a: "Guaranteed fact",
            option_a_hi: "पक्की गारंटी वाला तथ्य",
            option_b: "Magic spell",
            option_b_hi: "जादुई मंत्र",
            option_c: "Smart prediction based on patterns",
            option_c_hi: "पैटर्न पर आधारित समझदार भविष्यवाणी",
            option_d: "Random number",
            option_d_hi: "कोई भी संख्या",
            correct_answer: "C",
            explanation:
              "A forecast is a prediction from patterns in past data — useful, but not certain.",
            explanation_hi:
              "पूर्वानुमान पुराने डेटा के पैटर्न से की गई भविष्यवाणी है — उपयोगी, पर पक्की नहीं।",
          },
          {
            question_text: "Why does more good, varied data usually help an AI?",
            question_text_hi:
              "अधिक अच्छा और विविध डेटा आमतौर पर एआई की मदद क्यों करता है?",
            option_a: "It makes the AI heavier",
            option_a_hi: "इससे एआई भारी हो जाता है",
            option_b: "It lets the AI see more patterns and decide better",
            option_b_hi: "इससे एआई अधिक पैटर्न देखकर बेहतर निर्णय लेता है",
            option_c: "It slows the AI down on purpose",
            option_c_hi: "यह एआई को जानबूझकर धीमा करता है",
            option_d: "It deletes old knowledge",
            option_d_hi: "यह पुराना ज्ञान मिटा देता है",
            correct_answer: "B",
            explanation:
              "With more varied, correct examples, the AI learns richer patterns and makes better decisions.",
            explanation_hi:
              "अधिक विविध और सही उदाहरणों से एआई बेहतर पैटर्न सीखता है और बेहतर निर्णय लेता है।",
          },
        ],
      },
      {
        type: "task",
        title: "Teach a Machine (Thinking Task)",
        title_hi: "एक मशीन को सिखाएँ (सोचने का कार्य)",
        body:
          "Imagine you must teach an AI to tell apart 'apple' and 'orange' photos.\n\nWrite down: (1) what data you would collect, (2) how many examples of each you think you need, and (3) one mistake the AI might make if your data is unfair (for example, only red apples and no green ones). Write 4-6 sentences.",
        body_hi:
          "कल्पना करें कि आपको एक एआई को 'सेब' और 'संतरे' की तस्वीरें अलग करना सिखाना है।\n\nलिखें: (1) आप कौन-सा डेटा इकट्ठा करेंगे, (2) आपको लगता है हर एक के कितने उदाहरण चाहिए, और (3) अगर आपका डेटा अनुचित हुआ तो एआई कौन-सी एक गलती कर सकता है (उदाहरण के लिए, केवल लाल सेब और कोई हरा नहीं)। 4-6 वाक्य लिखें।",
      },
    ],
  },

  // ============================================================
  // LEVEL 3 — Using AI Responsibly
  // ============================================================
  {
    level_number: 3,
    title: "Using AI Responsibly",
    title_hi: "एआई का ज़िम्मेदारी से उपयोग",
    description:
      "Be a smart, safe user. Learn about bias, mistakes, privacy, and honesty when using AI.",
    description_hi:
      "एक समझदार और सुरक्षित उपयोगकर्ता बनें। एआई का उपयोग करते समय पूर्वाग्रह, गलतियों, निजता और ईमानदारी के बारे में जानें।",
    content: [
      {
        type: "reading",
        title: "AI Can Make Mistakes (Bias & Errors)",
        title_hi: "एआई गलतियाँ कर सकता है (पूर्वाग्रह और त्रुटियाँ)",
        body:
          "Because AI learns from data made by people, it can copy human mistakes and unfairness. This is called 'bias'.\n\nFor example, if an AI only saw photos of doctors who were men, it might wrongly assume all doctors are men. The AI is not being mean on purpose — it just repeats patterns from unfair data.\n\nAI can also be simply wrong: it may confidently give an answer that is incorrect. That is why you should always check important AI answers against a trusted source, and never assume the machine is always right.",
        body_hi:
          "क्योंकि एआई लोगों द्वारा बनाए गए डेटा से सीखता है, यह इंसानी गलतियों और अन्याय की नकल कर सकता है। इसे 'पूर्वाग्रह' (बायस) कहते हैं।\n\nउदाहरण के लिए, अगर किसी एआई ने केवल पुरुष डॉक्टरों की तस्वीरें देखी हों, तो वह गलत मान सकता है कि सभी डॉक्टर पुरुष होते हैं। एआई जानबूझकर बुरा नहीं कर रहा — यह बस अनुचित डेटा के पैटर्न दोहराता है।\n\nएआई बस गलत भी हो सकता है: यह पूरे विश्वास के साथ गलत जवाब दे सकता है। इसीलिए ज़रूरी एआई जवाबों को हमेशा किसी भरोसेमंद स्रोत से जाँचें, और कभी यह न मानें कि मशीन हमेशा सही होती है।",
      },
      {
        type: "reading",
        title: "Staying Safe and Honest with AI",
        title_hi: "एआई के साथ सुरक्षित और ईमानदार रहना",
        body:
          "AI tools are powerful, so use them responsibly.\n\nProtect your privacy: never share personal details like your full address, passwords, or phone number with an AI chatbot. Treat anything you type as if it could be seen by others.\n\nBe honest: using AI to learn, brainstorm, or check your work is great. But copying an AI's answer and calling it your own homework is cheating — and you also miss the chance to learn. A good rule is: let AI help you think, but make the final work your own.",
        body_hi:
          "एआई टूल शक्तिशाली होते हैं, इसलिए उनका ज़िम्मेदारी से उपयोग करें।\n\nअपनी निजता की रक्षा करें: किसी एआई चैटबॉट के साथ अपना पूरा पता, पासवर्ड या फ़ोन नंबर जैसी निजी जानकारी कभी साझा न करें। जो कुछ भी आप टाइप करें, उसे ऐसे समझें मानो उसे दूसरे लोग देख सकते हों।\n\nईमानदार रहें: सीखने, विचार पाने या अपने काम की जाँच के लिए एआई का उपयोग करना बहुत अच्छा है। लेकिन एआई का जवाब कॉपी करके उसे अपना होमवर्क बताना नकल है — और आप सीखने का मौका भी खो देते हैं। एक अच्छा नियम है: एआई को सोचने में मदद करने दें, पर अंतिम काम अपना बनाएँ।",
      },
      {
        type: "quiz",
        title: "Check: Responsible AI",
        title_hi: "जाँच: ज़िम्मेदार एआई",
        questions: [
          {
            question_text: "What is AI 'bias'?",
            question_text_hi: "एआई 'पूर्वाग्रह' (बायस) क्या है?",
            option_a: "When AI runs too fast",
            option_a_hi: "जब एआई बहुत तेज़ चलता है",
            option_b: "When AI repeats unfairness from its data",
            option_b_hi: "जब एआई अपने डेटा से अन्याय दोहराता है",
            option_c: "When AI is switched off",
            option_c_hi: "जब एआई बंद कर दिया जाता है",
            option_d: "When AI uses too much memory",
            option_d_hi: "जब एआई बहुत ज़्यादा मेमोरी लेता है",
            correct_answer: "B",
            explanation:
              "Bias is when an AI learns and repeats unfair patterns present in its training data.",
            explanation_hi:
              "पूर्वाग्रह तब है जब एआई अपने ट्रेनिंग डेटा में मौजूद अनुचित पैटर्न सीखकर दोहराता है।",
          },
          {
            question_text:
              "An AI gives you an answer for an important school project. What should you do?",
            question_text_hi:
              "एआई आपको एक ज़रूरी स्कूल प्रोजेक्ट के लिए जवाब देता है। आपको क्या करना चाहिए?",
            option_a: "Trust it completely without checking",
            option_a_hi: "बिना जाँचे पूरी तरह भरोसा करें",
            option_b: "Check it against a trusted source",
            option_b_hi: "किसी भरोसेमंद स्रोत से उसे जाँचें",
            option_c: "Assume it can never be wrong",
            option_c_hi: "मान लें कि यह कभी गलत नहीं हो सकता",
            option_d: "Delete the project",
            option_d_hi: "प्रोजेक्ट मिटा दें",
            correct_answer: "B",
            explanation:
              "AI can be confidently wrong, so verify important answers with a trusted source.",
            explanation_hi:
              "एआई पूरे विश्वास से गलत हो सकता है, इसलिए ज़रूरी जवाबों को भरोसेमंद स्रोत से जाँचें।",
          },
          {
            question_text:
              "Which of these should you NOT share with an AI chatbot?",
            question_text_hi:
              "इनमें से क्या आपको एआई चैटबॉट के साथ साझा नहीं करना चाहिए?",
            option_a: "A general question about science",
            option_a_hi: "विज्ञान के बारे में एक सामान्य सवाल",
            option_b: "Your password and home address",
            option_b_hi: "आपका पासवर्ड और घर का पता",
            option_c: "A request to explain a topic",
            option_c_hi: "किसी विषय को समझाने का अनुरोध",
            option_d: "An idea for a story",
            option_d_hi: "किसी कहानी का विचार",
            correct_answer: "B",
            explanation:
              "Never share private details like passwords or your address with an AI tool.",
            explanation_hi:
              "पासवर्ड या पते जैसी निजी जानकारी किसी एआई टूल के साथ कभी साझा न करें।",
          },
          {
            question_text:
              "Which use of AI for homework is honest and helpful?",
            question_text_hi:
              "होमवर्क के लिए एआई का कौन-सा उपयोग ईमानदार और मददगार है?",
            option_a: "Copying its answer word for word as your own",
            option_a_hi: "उसका जवाब हूबहू कॉपी करके अपना बताना",
            option_b: "Using it to explain a concept you then write yourself",
            option_b_hi: "किसी अवधारणा को समझने के लिए उपयोग करना और फिर खुद लिखना",
            option_c: "Letting it do the whole assignment for you",
            option_c_hi: "उससे पूरा असाइनमेंट करवा लेना",
            option_d: "Hiding that you used it when it was not allowed",
            option_d_hi: "जब अनुमति न हो तब उपयोग छुपाना",
            correct_answer: "B",
            explanation:
              "Letting AI help you understand, then doing the work yourself, is honest and helps you learn.",
            explanation_hi:
              "एआई से समझने में मदद लेना और फिर खुद काम करना ईमानदार है और सीखने में मदद करता है।",
          },
          {
            question_text: "Why is it smart to treat AI answers carefully?",
            question_text_hi:
              "एआई के जवाबों को सावधानी से लेना समझदारी क्यों है?",
            option_a: "AI is always perfectly correct",
            option_a_hi: "एआई हमेशा बिल्कुल सही होता है",
            option_b: "AI can be biased or simply wrong",
            option_b_hi: "एआई पूर्वाग्रही या बस गलत हो सकता है",
            option_c: "AI charges money for each answer",
            option_c_hi: "एआई हर जवाब के पैसे लेता है",
            option_d: "AI only speaks one language",
            option_d_hi: "एआई केवल एक भाषा बोलता है",
            correct_answer: "B",
            explanation:
              "Since AI can carry bias and make mistakes, it is wise to think critically about its answers.",
            explanation_hi:
              "चूँकि एआई में पूर्वाग्रह हो सकता है और यह गलती कर सकता है, इसके जवाबों पर सोच-समझकर विचार करना बुद्धिमानी है।",
          },
        ],
      },
      {
        type: "task",
        title: "Write Your AI Code of Conduct",
        title_hi: "अपना एआई आचार-संहिता लिखें",
        body:
          "Create your own short set of rules for using AI responsibly. Write 5 rules in your own words.\n\nInclude at least one rule about privacy, one about honesty (not cheating), and one about double-checking important answers. Share your rules with your family and ask if they agree.",
        body_hi:
          "एआई का ज़िम्मेदारी से उपयोग करने के लिए अपने खुद के छोटे नियम बनाएँ। अपने शब्दों में 5 नियम लिखें।\n\nकम से कम एक नियम निजता के बारे में, एक ईमानदारी (नकल न करने) के बारे में, और एक ज़रूरी जवाबों को दोबारा जाँचने के बारे में शामिल करें। अपने नियम अपने परिवार के साथ साझा करें और पूछें कि क्या वे सहमत हैं।",
      },
    ],
  },
];

async function existingLevelCount(): Promise<number> {
  const { count, error } = await supabase
    .from("ai_literacy_levels")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function wipe(): Promise<void> {
  // Deleting levels cascades to content -> quiz questions -> progress.
  const { error } = await supabase
    .from("ai_literacy_levels")
    .delete()
    .not("id", "is", null);
  if (error) throw new Error(`Failed to wipe levels: ${error.message}`);
  console.log("Wiped existing AI Literacy data (levels + cascaded rows).");
}

async function seed(): Promise<void> {
  let levelCount = 0;
  let readingCount = 0;
  let quizCount = 0;
  let taskCount = 0;
  let questionCount = 0;

  for (const level of LEVELS) {
    const { data: levelRow, error: levelError } = await supabase
      .from("ai_literacy_levels")
      .insert({
        level_number: level.level_number,
        title: level.title,
        title_hi: level.title_hi,
        description: level.description,
        description_hi: level.description_hi,
        is_published: true,
      })
      .select("id")
      .single();

    if (levelError || !levelRow) {
      throw new Error(
        `Failed to insert level ${level.level_number}: ${levelError?.message}`
      );
    }
    levelCount++;
    console.log(`Level ${level.level_number}: ${level.title}`);

    for (let position = 0; position < level.content.length; position++) {
      const item = level.content[position];
      const { data: contentRow, error: contentError } = await supabase
        .from("ai_literacy_content")
        .insert({
          level_id: levelRow.id,
          type: item.type,
          title: item.title,
          title_hi: item.title_hi,
          body: item.body ?? null,
          body_hi: item.body_hi ?? null,
          position,
          is_published: true,
        })
        .select("id")
        .single();

      if (contentError || !contentRow) {
        throw new Error(
          `Failed to insert content "${item.title}": ${contentError?.message}`
        );
      }

      if (item.type === "reading") readingCount++;
      if (item.type === "task") taskCount++;
      console.log(`  - [${item.type}] ${item.title}`);

      if (item.type === "quiz" && item.questions) {
        quizCount++;
        const rows = item.questions.map((q, qIndex) => ({
          content_id: contentRow.id,
          question_text: q.question_text,
          question_text_hi: q.question_text_hi,
          option_a: q.option_a,
          option_a_hi: q.option_a_hi,
          option_b: q.option_b,
          option_b_hi: q.option_b_hi,
          option_c: q.option_c,
          option_c_hi: q.option_c_hi,
          option_d: q.option_d,
          option_d_hi: q.option_d_hi,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          explanation_hi: q.explanation_hi,
          position: qIndex,
        }));

        const { error: questionError } = await supabase
          .from("ai_literacy_quiz_questions")
          .insert(rows);

        if (questionError) {
          throw new Error(
            `Failed to insert questions for "${item.title}": ${questionError.message}`
          );
        }
        questionCount += rows.length;
        console.log(`      (${rows.length} quiz questions)`);
      }
    }
  }

  console.log("\nSeed complete:");
  console.log(`  Levels:          ${levelCount}`);
  console.log(`  Readings:        ${readingCount}`);
  console.log(`  Tasks:           ${taskCount}`);
  console.log(`  Quizzes:         ${quizCount}`);
  console.log(`  Quiz questions:  ${questionCount}`);
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");

  const count = await existingLevelCount();
  if (count > 0 && !force) {
    console.log(
      `AI Literacy already has ${count} level(s). Nothing seeded.\n` +
        "Re-run with --force to wipe and reseed: npm run seed:ai-literacy -- --force"
    );
    return;
  }

  if (force && count > 0) {
    await wipe();
  }

  await seed();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nSeed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
