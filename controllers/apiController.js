const { CostExplorer } = require('aws-sdk')
const parseStringPromise = require('xml2js').parseStringPromise

require('dotenv').config()

const fetchArxivData = async function(topic, max_results) {
  const apiUrl = `http://export.arxiv.org/api/query?search_query=all:${topic}&start=0&max_results=${max_results}`

  try {
    const response = await fetch(apiUrl)
    const xml = await response.text()

    const result = await parseStringPromise(xml)
    const entries = result.feed.entry || []

    const pdfLinks = entries.map(entry => {
      const idUrl = entry.id[0]
      const arxivId = idUrl.split('/abs/')[1]
      return `http://arxiv.org/pdf/${arxivId}`
    })

    return pdfLinks

  } catch (err) {
    console.error(err.message)
    return []
  }
}

const extractMethodology = async(Text)=>{
    const response = fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDJpi_-C3gle3k_YspxWqIVV6abO7swZco",{
        method : 'POST',
        headers : {
            'content-type' : 'application/json'
        },
        body : JSON.stringify({
            "contents": [
      {
        "parts": [
          {
            "text": `Read the given research paper carefully and identify the methodology and literature review and try to keep the output short and under 1000-2000 words and no extra content : ${Text}`
          }
        ]
      }
    ]
        })
    })
    const result = await (await response).json();
    return result.candidates[0].content.parts[0].text
}

module.exports = {
  fetchArxivData,
  extractMethodology
}