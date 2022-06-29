const bd = document.querySelector(".backdrop")
const result = document.getElementById("result")
const moreBtn = document.getElementById("loadmore")
const modalDetail = document.getElementById("modaldetail")
const loader = document.getElementById("loader")
const body = document.querySelector("body")
const html = document.querySelector("html")
let cl = console.log
let ok = "here"

// overlay elements 
function aside_open( el ) {
    document.querySelector("aside").classList.add("show")
    bd.classList.add("show")
}

function modal_close ( el ) {
    fadeOut( el.parentElement.parentElement.parentElement )
    bd.classList.remove("show")

    body.classList.remove("noscroll")
}

function bd_close ( el ) {
    let topElements = [
        ...document.querySelectorAll(".modal"),
        document.querySelector("aside")
    ]
    for (let item of topElements) {
        item.classList.remove("show")
    }
    fadeOut( el )

    body.classList.remove("noscroll")
}

// VARIABLE & ELEMENTS 
const url = {
    endPoint: "https://api.jikan.moe/v4/",
    path: "anime",
    mode: "anime",
    nextPage: false,
    kosong: true,
    query: {q: "", page: 1, sfw: true},
    queries: function () {
        if ( this.query == {} ) return " "
        let str = [];
        for ( let item in this.query) {
            if ( typeof item != undefined) {
                str.push(`${item}=${this.query[item]}`)
            }
        }
        return "?" + str.join("&")
    }
}

// TOP VARIABLES
let charRank = 1

// GENRE VARIABLE 
let genreSelected = []

// GET DATA 
function fetching ( obj ) {
//     console.log(obj.endPoint + obj.path + obj.queries())
    let datas = fetch(obj.endPoint + obj.path + obj.queries())
                .then( res => {

                    document.querySelectorAll(".loader")
                    .forEach( l => l.classList.remove("on") )

                    if ( res.status != 200 ) {
                        result.innerHTML = `
                        <figure class="empty">
                            <img src="img/error.svg" alt="">
                            <figcaption>Erorr! Segera refresh halaman ini!</figcaption>
                        </figure>
                        `
                        return false
                    } 
                    else {
                        return res.json()
                    }

                }).then(data => data)

    return datas    
}

async function getting () {
    
    document.getElementById("loader").classList.add("on")

    let datas = await fetching( url )
    url.nextPage = datas.pagination['has_next_page']

    if ( !datas ) return false

//     cl(datas)
    displaying( url.path, datas.data, true)
    tooltips()

    !url.nextPage ? 
    moreBtn.classList.add("disabled") :
    moreBtn.classList.remove("disabled")
}

async function get_detail( el ) {

    document.getElementById("loader").classList.add("on")

    let anime = {...url} 
    anime.path = `${anime.mode}/${el.dataset.id}/full`
    anime.query = {}

    let datas = await fetching(anime)

    if ( anime.path === `characters/${el.dataset.id}/full` ) {
        modalDetail.innerHTML = char_modal_template( datas.data)
    } else {
        modalDetail.innerHTML = anime_modal_template( datas.data)
    }

    modalDetail.classList.add("show")
    bd.classList.add("show")
    tooltips()
    
    modalDetail.scrollTop = 0
    body.classList.add("noscroll")
}

moreBtn.onclick = async event => {
    url.query.page += 1

    document.getElementById("loader").classList.add("on")

    let datas = await fetching( url )
    url.nextPage = datas.pagination['has_next_page']

    console.log(datas)
    displaying( url.path, datas.data, false)
    tooltips()

    !url.nextPage ? 
    moreBtn.classList.add("disabled") :
    moreBtn.classList.remove("disabled")
}

async function gettingChars ( el ) {

    document.getElementById("loader2").classList.add("on")

    let id = el.dataset.id 
    let charObj = {...url}

    charObj.path = `anime/${id}/characters`
    charObj.query = {}

    let charDatas = await fetching(charObj)
//     console.log(charDatas)

    let charCard = ""
    if ( charDatas.data.length != 0 ) {
        charDatas.data.forEach( dat => {
            charCard += `
            <div class="card">
                <figure>
                    <img src="${dat.character.images ? dat.character.images.jpg['image_url'] : 'img/thumb.png' }" alt="">
                </figure>
                <div class="tooltip" data-title="${dat.character.name}">
                    <h5>${dat.character.name}</h5>
                    <span>${dat.role}</span>
                </div>
            </div>   
            `
        })
    }

    el.parentElement.previousElementSibling.textContent = charDatas.data.length + " characters"
    el.parentElement.innerHTML = charCard

    tooltips()
}

// FILTER MENU ASIDE 
function sfw ( el ) {
    el.classList.toggle("active")

    if (el.classList.contains("active")) {
        el.previousElementSibling.checked = true
        url.query.sfw = true
    } else {
        el.previousElementSibling.checked = false
        delete url.query.sfw
    } 
}

function pathing( el ) {
    [...el.parentElement.children]
    .forEach( btn => btn.classList.remove("active"))
    el.classList.add("active")

    url.path = el.dataset.path
    url.mode = el.dataset.path

    html.scrollTop = 0

}

function toping( el ) {
    [...el.parentElement.children]
    .forEach( btn => btn.classList.remove("active"))
    el.classList.add("active")

    url.path = `top/${el.dataset.path}`
    url.mode = el.dataset.path
    url.query.page = 1
    charRank = 1
    delete url.query.q 
    
//     cl(url)
    getting()

    html.scrollTop = 0
}

function ordering( el ) {
    [...el.parentElement.children]
    .forEach( btn => btn.classList.remove("active"))
    el.classList.add("active")

    url.query['order_by'] = el.dataset.order 
    url.query['sort'] = "desc"

    if ( !url.kosong ) {
        getting()
        url.kosong = false
    }

    html.scrollTop = 0
}

function sorting( el ) {
    [...el.parentElement.children]
    .forEach( btn => btn.classList.remove("active"))
    el.classList.add("active")

    url.query['sort'] = el.dataset.sort

    if ( !url.kosong ) {
        getting()
        url.kosong = false
    }

    html.scrollTop = 0
}

function daying ( el ) {
    [...el.parentElement.children]
    .forEach( btn => btn.classList.remove("active"))
    el.classList.add("active")

    url.path = "schedules"
    url.query = { 
        filter: el.dataset.day,
        page: 1,
        sfw: true
    }

    getting()
    html.scrollTop = 0
}

function clearing( el ) {
    [...el.parentElement.children]
    .forEach( btn => btn.classList.remove("active"))

    delete url.query[el.dataset.clear]

    if ( !url.kosong ) {
        getting()
        url.kosong = false
    }

    html.scrollTop = 0
}

function cleargenres() {
    document.querySelectorAll(".genre-menu")
    .forEach( btn => btn.classList.remove("active"))

    html.scrollTop = 0

    if ( genreSelected.length == 0 ) return

    genreSelected = []
    delete url.query.genres
    result.innerHTML = ""
    moreBtn.classList.add("disabled")
}

// SEARHC PAGE 
async function searching( el, event ) {
    event.preventDefault()

    let val = el.key.value.toLowerCase()
    url.query.q = val
    url.query.page = 1

    url.kosong = false
    getting()
}

// GENRES PAGE 
async function showGenres ( req ) {
    let gen = {...url}
    gen.path = "genres/anime"
    gen.query = {filter: req }

    let datas = await fetching(gen)
    return datas.data
}

function genresing( el ) {
    el.classList.add("active")

    genreSelected.push( el.dataset.genres)
    
    url.path = "anime"
    url.query.genres = genreSelected.join(",")
    url.query.page = 1
    
    getting()
    url.kosong = false

    cl(genreSelected.join(","))

    html.scrollTop = 0
}

// SEASONS PAGE 
async function showSeasons () {
    let ses = {...url}
    ses.path = "seasons"
    ses.query = {}

    let datas = await fetching(ses)
    return datas.data.map( d => d.year)
}

function seasoning () {
    let year = document.getElementById("year").value
    let season = document.getElementById("season").value

    url.path = `seasons/${year}/${season}`
    url.query = { page: 1 }

    getting()
    url.kosong = false

}

// RENDER DISPLAY 
function displaying ( type, data, clean = true ) {
    
    if ( clean ) result.innerHTML = ""

    if ( data.length == 0 ) {
        result.innerHTML = `
        <figure class="empty">
            <img src="img/empty.svg" alt="">
            <figcaption>Tidak ada hasil yang ditemukan!</figcaption>
        </figure>
        `
        return false
    }

    data.forEach( dat => {
        if ( type == "characters" || type == "top/characters") {
            result.innerHTML += char_card_template(dat, charRank)
            charRank++
        } else {
            result.innerHTML += anime_card_template(dat)
        }
    })
}

// TEMPLATE 
function anime_card_template ( data ) {
    let ani = {
        img: data.images ? 
                data.images.jpg['image_url'] : 'img/thumb.png',
        genre: data.genres.length != 0 ? 
                data.genres[0]['name'] : 'none' ,
        demo: data.demographics.length != 0 ? 
                data.demographics[0]['name'] : 'none',
    }
    return `
    <div class="card" onclick="get_detail(this)" data-id="${ data['mal_id'] }">
        <figure>
            <img src="${ ani.img }" alt="">
            ${ url.path == 'top/anime' ? `<span>${data.rank}</span>` : ''}
        </figure>
        <div class="tooltip" data-title="${data.title}">
            <h5>${data.title}</h5>
            <div class="card-attrs">
                <span>
                    <i class="material-icons-outlined">movie</i>
                    ${data.type}
                </span>
                <span>
                    <i class="material-icons-outlined">play_arrow</i>
                    ${data.episodes} eps
                </span>
                <span>
                    <i class="material-icons outlined">star</i>
                   ${data.score}
                </span>
            </div>
            <span>${ ani.genre } | ${ ani.demo }</span>
        </div>
    </div>
    `
}

function char_card_template ( data, rank = 1 ) {
    let ani = {
        img: data.images ? 
                data.images.jpg['image_url'] : 'img/thumb.png',
    }
    return `
    <div class="card" onclick="get_detail(this)" data-id="${ data['mal_id'] }">
        <figure>
            <img src="${ ani.img }" alt="">
            ${ url.path == 'top/characters' ? `<span>${rank}</span>` : ''}
        </figure>
        <div class="tooltip" data-title="${data.name}">
            <h5>${data.name}</h5>
            <div class="card-attrs">
                <span>
                    <i class="material-icons-outlined">favorite</i>
                    ${data.favorites}
                </span>
                <span>
            </div>
        </div>
    </div>
    `
}

function anime_modal_template ( data ) {
    let ani = {
        img: data.images ? 
                data.images.jpg['image_url'] : 'img/thumb.png',   
        looping: arr => {
            let str = []
            if ( arr.length != 0 ) {
                arr.forEach( item => str.push(item.name) )
            }
            return str.join(", ")
        },
    }
    
    return `
    <div class="head">
        <div>
            <button type="button" class="btn btn-t btn-icon material-icons" onclick="modal_close(this)">
                navigate_before
            </button>
            <div  class="anime-title">
                <h5>${data.title}</h5>
            </div>
        </div>
        <div class="loader" id="loader2">
            <div></div>
        </div>
    </div>
    <div class="content d-flex">
        <div class="left">

            <figure class="anime-img">
                <img src="${ani.img}"/>
            </figure>
            <div class="stats">
                <span class="anime-score">
                    <p class="type">score</p>
                    <p class="isi">${data.score}</p>
                </span>
                <span class="iconize anime-rank">
                    <p class="type">rank</p>
                    <p class="isi">#${data.rank}</p>
                </span>
                <span class="iconize anime-popularity">
                    <p class="type">popularity</p>
                    <p class="isi">#${data.popularity}</p>
                </span>
                <span class="iconize anime-favorites">
                    <p class="type">favorite</p>
                    <p class="isi">${data.favorites}</p>
                </span>
            </div>
        </div>
        <div class="right">
            <div class="anime-synopsys">
                <h5>Synopsis</h5>
                <p>${ data.synopsis }</p>
            </div>
            <div class="anime-background">
                <h5>Background</h5>
                <p>${ data.background }</p>
            </div>
            <div class="anime-info">
                <h5>Information</h5>
                <div>
                    <span>
                        <p class="type">Type</p>
                        <p class="isi">: ${data.type}</p>
                    </span>
                    <span>
                        <p class="type">Episodes</p>
                        <p class="isi">: ${data.episodes}</p>
                    </span>
                    <span>
                        <p class="type">Duration</p>
                        <p class="isi">: ${data.duration}</p>
                    </span>
                    <span>
                        <p class="type">Genres</p>
                        <p class="isi">: ${ani.looping(data.genres)}</p>
                    </span>
                    <span>
                        <p class="type">Themes</p>
                        <p class="isi">: ${ani.looping(data.themes)}</p>
                    </span>
                    <span>
                        <p class="type">Demographic</p>
                        <p class="isi">: ${ani.looping(data.demographics)}</p>
                    </span>
                    <span>
                        <p class="type">Source</p>
                        <p class="isi">: ${data.source} </p>
                    </span>
                    <span>
                        <p class="type">rating</p>
                        <p class="isi">: ${data.rating}</p>
                    </span>
                    <span>
                        <p class="type">status</p>
                        <p class="isi">: ${data.status}</p>
                    </span>
                    <span>
                        <p class="type">Aired</p>
                        <p class="isi">: ${data.aired.string}</p>
                    </span>
                    <span>
                        <p class="type">Premiered</p>
                        <p class="isi">: ${data.season} ${data.year}</p>
                    </span>
                    <span>
                        <p class="type">Producers</p>
                        <p class="isi">: ${ani.looping(data.producers)}</p>
                    </span>
                    <span>
                        <p class="type">Licensors</p>
                        <p class="isi">: ${ani.looping(data.licensors)}</p>
                    </span>
                    <span>
                        <p class="type">Studios</p>
                        <p class="isi">: ${ani.looping(data.studios)}</p>
                    </span>
                </div>
            </div>
            <div class="anime-chars">
                <h5>Characters</h5>
                <span class="count-chars">0 characters</span>
                <div class="cards">
                    <button type="button" class="btn btn-s" data-id="${data.mal_id}" onclick="gettingChars(this)" >Load Characters</button>
                </div>
            </div>
            <div class="anime-link">
                <h5>Link</h5>
                <div>
                    <a target="_blank" href="${ data.trailer.url == null ? "#" : data.trailer.url }" class="btn">trailer</a>
                    <a target="_blank" href="${data.url}" class="btn">myanimelist</a>
                </div>
            </div>
        </div>
    </div>
    `
}

function char_modal_template ( data ) {
    let chr = {
        img: data.images ? 
                data.images.jpg['image_url'] : 'img/thumb.png',
        cardLoop: arr => {
            let str = ""
            if ( arr.length != 0 ) {
                arr.forEach( item => {
                    let types = ["anime", "manga", "person"]
                    let type = types.find( t => item.hasOwnProperty(t)) 

                    str += `
                    <div class="card">
                        <figure>
                            <img src="${item[type].images ? item[type].images.jpg['image_url'] : 'img/thumb.png' }" alt="">
                        </figure>
                        <div class="tooltip" data-title="${ item.role ? item[type].title : item[type].name }">
                            <h5>${item.role ? item[type].title : item[type].name }</h5>
                            <span>${item.role ? item.role : item.language}</span>
                        </div>
                    </div>   
                    `
                })
            }
            return str
        }   
    }

    return `
    <div class="head">
        <div>
            <button class="btn btn-t btn-icon material-icons" onclick="modal_close(this)">
                navigate_before
            </button>
            <div  class="anime-title">
                <h5>${data.name}</h5>
            </div>
        </div>
    </div>
    <div class="content d-flex">
        <div class="left">

            <figure class="anime-img">
                <img src="${chr.img}" alt="">
            </figure>
            <div class="stats">
                <span class="anime-score">
                    <p class="type">favorites</p>
                    <p class="isi">${data.favorites}</p>
                </span>
            </div>
        </div>
        <div class="right">
            <div class="char-about">
                <h5>About</h5>
                <p>${data.about}</p>
            </div>
            <div class="char-anime">
                <h5>Anime</h5>
                <div class="cards">
                    ${chr.cardLoop(data.anime)}
                </div>
            </div>
            <div class="char-manga">
                <h5>Manga</h5>
                <div class="cards">
                    ${chr.cardLoop(data.manga)}
                </div>
            </div>
            <div class="char-seiyuu">
                <h5>Voice</h5>
                <div class="cards">
                    ${chr.cardLoop(data.voices)}
                </div>
            </div>
            <div class="anime-link">
                <h5>Link</h5>
                <div>
                    <a target="_blank" href="${data.url}" class="btn">myanimelist</a>
                </div>
            </div>
        </div>
    </div>
    `
}

// ANIMATION
function fadeOut(el, duration = 400) {
    el.style.animationName = "fadeout";
  
    setTimeout(() => {
      el.style.animationName = "fade";
      el.classList.remove("show");
    }, duration);
}

tooltips()
function tooltips() {
    const tooltips = document.querySelectorAll(".tooltip");
  
    tooltips.forEach((tooltip) => {
        let t = tooltip.style;
    
        tooltip.onmouseover = (Event) => {
            tooltip.classList.add("show");
        };
        tooltip.onmousemove = (Event) => {
            let x = Event.clientX - tooltip.getBoundingClientRect().left - 50;
            let y = Event.clientY - tooltip.getBoundingClientRect().top + 20;
    
            t.setProperty("--top", `${y}px`);
            t.setProperty("--left", `${x}px`);
        };
        tooltip.onmouseleave = (Event) => {
            t.setProperty("--anim", "fadeout");
    
            setTimeout(() => {
            t.setProperty("--anim", "fade");
            tooltip.classList.remove("show");
            }, 350);
        };
    });
}

