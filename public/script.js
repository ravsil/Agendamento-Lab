function getDate() {
    let currentDate = new Date();
    let day = currentDate.getDate()
    if (day < 10) {
        day = `0${day}`
    }
    let month = currentDate.getMonth() + 1
    if (month < 10) {
        month = `0${month}`
    }
    let date = `${day}/${month}`
    return date

}

function setImage() {
    let img = document.createElement("img");
    img.setAttribute("src", "https://media.discordapp.net/attachments/1176205653086318711/1225908295869534348/computador.png?ex=6622d712&is=66106212&hm=cf29d8ac3eb325ac0fd95a3cbef2d5fc37ebb518f9aa2ea93fc48069973a98f7&=&format=webp&quality=lossless&width=421&height=421");
    img.className = "img-fluid grower";
    return img;
}

function setInfo(index) {
    let info = document.createElement("div");
    info.className = "info";
    info.id = `${index}`
    info.innerText = `Computador ${info.id}\nMemória RAM: 0GB\nProcessador: processador`
    return info;
}

function setItem(img, info) {
    let item = document.createElement("div");
    item.className = "col-sm-5 col-md-2 mb-4";
    item.appendChild(img);
    item.appendChild(info);
    item.onclick = function () {
        console.log("hello world")
    }
    return item;
}

function generateComputers() {
    let index = 0;
    document.getElementById("txt-Principal").innerText += ` (${getDate()})`
    for (let i = 0; i < 4; i++) {
        let row = document.createElement("div");
        row.className = "row mb-5 mt-5 justify-content-around";
        for (let j = 0; j < 6; j++) {
            let img = setImage();
            let info = setInfo(index++);
            let item = setItem(img, info);
            row.appendChild(item);
        }
        document.getElementById("container0").appendChild(row);
    }


}

window.addEventListener('load', generateComputers);