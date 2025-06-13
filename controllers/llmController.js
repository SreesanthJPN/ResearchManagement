const s3Controller = require('./s3Controller');
const {fetchArxivData} = require('./apiController');
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
require('dotenv').config()
                         
// const fetchPapersText = async (Topic, Max_papers) => {
//     try {
//         const papers = await fetchArxivData(Topic, Max_papers)
        
//         await Promise.all(papers.map(link => s3Controller.uploadFileFromLinks(link)))
//         await s3Controller.createPapersText()
        
//         const client = s3Controller.s3
//         const res = await client.send(new GetObjectCommand({
//             Bucket : process.env.BUCKET_NAME,
//             Key : 'Papers.txt'
//         }))
        
//         const chunks = []
//         for await (const chunk of res.Body) {
//             chunks.push(chunk)
//         }
//         const buffer = Buffer.concat(chunks)
//         const text = buffer.toString('utf-8')
//         return text
//     } catch (err) {
//         console.error('Error in fetchPapersText:', err)
//         throw err
//     }
// }

const getLLMResponse = async(Text)=>{
    const response = fetch("https://openrouter.ai/api/v1/chat/completions",{
        method : 'POST',
        headers : {
            'Authorization' : `Bearer ${process.env.DEEPSEEK_KEY}`,
            'content-type' : 'application/json'
        },
        body : JSON.stringify({
            model : 'deepseek/deepseek-r1-zero:free',
            messages : [
                {
                    role : 'user',
                    content : `Read and analyze the below research papers and their literature review carefully and find a poosible research Gap and area of research. The output should be in markdown format. Papers:- 
                    ${Text.slice(0,128000)}`
                }
            ]
        })
    })
    const result = await (await response).json();
    return result.choices[0].message.content
}

module.exports = {getLLMResponse}