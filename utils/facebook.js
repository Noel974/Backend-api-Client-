import axios from "axios";

const PAGE_ID = process.env.FB_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;

export async function publierSurFacebook({ nom, prenom, titre, introduction, url }) {
  try {
    const message = `
📘 Nouveau contenu publié !

👤 Formateur : ${prenom} ${nom}
📚 Titre : ${titre}
📝 Introduction :
${introduction}

🔗 Voir le contenu complet :
${url}
`;

    const response = await axios.post(
      `https://graph.facebook.com/${PAGE_ID}/feed`,
      {
        message,
        link: url,
        access_token: PAGE_ACCESS_TOKEN,
      }
    );

    return response.data;
  } catch (err) {
    console.error("Erreur publication Facebook :", err.response?.data || err);
    return null;
  }
}
