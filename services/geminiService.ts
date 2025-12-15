import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

let client: GoogleGenAI | null = null;

// Initialize client lazily to avoid immediate errors if key is missing during render
const getClient = () => {
  if (!client && process.env.API_KEY) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const getRecipeSuggestion = async (product: Product): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "عذراً، خدمة المساعد الذكي غير متوفرة حالياً (مفتاح API مفقود).";
  }

  try {
    const prompt = `
      أنت طباخ سعودي خبير وماهر في المطبخ العربي الشعبي والحديث.
      لدي منتج مجمد اسمه: "${product.name}".
      وصفه: "${product.description}".
      
      من فضلك اقترح عليّ وصفة شهية ومختصرة يمكنني تحضيرها باستخدام هذا المنتج.
      اجعل الرد باللهجة السعودية البيضاء المحببة والمرحبة.
      نسق الرد بشكل جميل وقائمة منقطة للمقادير والخطوات.
      لا تطل كثيراً، اجعلها وصفة سهلة وسريعة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم أستطع ايجاد وصفة مناسبة، حاول مرة أخرى!";
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return "حدث خطأ أثناء الاتصال بالشيف الذكي. يرجى المحاولة لاحقاً.";
  }
};

export const getGeneralAdvice = async (query: string): Promise<string> => {
    const ai = getClient();
    if (!ai) {
      return "عذراً، خدمة المساعد الذكي غير متوفرة حالياً.";
    }
  
    try {
      const prompt = `
        أنت مساعد لشركة "ركن العمارية" للمجمدات الغذائية.
        يسألك العميل: "${query}"
        
        أجب باختصار واحترافية وودية باللهجة السعودية. ركز على جودة المنتجات وطرق التخزين أو الطهي.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
  
      return response.text || "لا توجد إجابة حالياً.";
    } catch (error) {
      console.error("Error fetching advice:", error);
      return "حدث خطأ، يرجى المحاولة لاحقاً.";
    }
  };

export const generateProductDescription = async (name: string, brand: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "وصف تلقائي غير متوفر.";

  try {
    const prompt = `
      أكتب وصف تسويقي جذاب ومختصر (سطرين كحد أقصى) لمنتج غذائي.
      اسم المنتج: ${name}
      الشركة: ${brand}
      
      استخدم لغة عربية فصحى بسيطة مخلوطة بلمسة سعودية (مثال: لذيذ، فاخر، على كيفك).
      ركز على الطعم والجودة. لا تذكر السعر.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating description:", error);
    return "";
  }
};

export const analyzeFridgeImage = async (base64Image: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "خدمة تحليل الصور غير متوفرة حالياً.";

  try {
    // Extract mimeType and base64 data
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image format");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const prompt = `
      أنت شيف ذكي في تطبيق "ركن العمارية".
      لقد قام العميل بتصوير محتويات ثلاجته أو المكونات التي لديه.
      1. تعرف على المكونات الموجودة في الصورة.
      2. اقترح طبخة ذكية يمكن تحضيرها بهذه المكونات.
      3. والأهم: اقترح منتجات مجمدة (لحوم، دجاج، خضروات، بطاطس) من "ركن العمارية" تكمل هذه الطبخة وتجعلها ألذ.
      
      تحدث بلهجة سعودية ودية ومرحة.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } }
        ]
      }
    });

    return response.text || "لم أتمكن من تحليل الصورة بوضوح.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "حدث خطأ أثناء تحليل الصورة، حاول مرة أخرى بصورة أوضح.";
  }
};