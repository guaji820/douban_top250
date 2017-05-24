const http = require('http'),
    https = require('https'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    {target, port, path0, pageSize} = require('./common/config')

const url = port===80?`${target}${path0}`:`${target}:${port}${path0}`

function downloadImg(imgDir, url){
    https.get(url, res=>{
        let data = ''
        res.setEncoding('binary')
        res.on('data', chunk=>{
            data += chunk
        })
        res.on('end', ()=>{
            fs.writeFile(imgDir + path.basename(url), data, 'binary', err=>{
                if(err){
                    return console.log('1err:',err)
                }else{
                    console.log('Img download:' + path.basename(url))
                }
            })
        })
    }).on('error', err=>{
        console.log('imgerror:',err)
    })
}

function saveJSON(jsonPath, movies){
    console.log(movies)
    fs.writeFile(jsonPath, JSON.stringify(movies, null, " "), err=>{
        if(err){
            return console.log('dataerror:',err)
        } 
        else {
            console.log('data saved')
        }
    })
}

function spiderMovie(index){
    https.get('https://'+url+'?start=' + index, res=>{
        let html = ''
        let movies = []
        res.setEncoding('utf-8')

        res.on('data', chunk=>{
            html += chunk
        })
        res.on('end', ()=>{
            // console.log(html)
            let $ = cheerio.load(html)
            $('.item').each(function(){//这里注意不要使用箭头函数，this会失效
                let picUrl = $('.pic img',this).attr('src')
                let movie = {
                    title: $(this).find('.title').text(),
                    star: $(this).find('.info .star .rating_num').text(),
                    link: $(this).find('a').attr('href'),
                    picUrl,
                }
                if(movie){
                    movies.push(movie)
                }
                downloadImg('./imgStorage/', movie.picUrl)
            })
            saveJSON('./jsonStorage/json'+index+'.json', movies)
        })
    }).on('error', err=>{
        console.log(err)
    })
}
function *dospider(limit){
    let start = 0
    while(start<limit){
        yield start
        spiderMovie(start)
        start += pageSize
    }
}

for(let x of dospider(50)){
    console.log(x)
}

/*
let spider = co(function *(limit){
    let start = 0
    while (start <limit){
        yield start
        spiderMovie(start)
        start += pageSize
    }
})

spider()
*/