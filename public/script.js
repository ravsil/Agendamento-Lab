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
    img.setAttribute("src", "https://cdn.discordapp.com/attachments/1176205653086318711/1225908295869534348/computador.png?ex=662b68d2&is=662a1752&hm=d6908089556ad123cfcf2ccba1e153ec3d7d1b794fe3e28ccb8d49e0f32a9568&");
    img.className = "img-fluid grower";
    return img;
}

function setInfo(index) {
    let info = document.createElement("div");

    // jeito feio de arrumar os elementos no mobile
    if (index % 3 == 0 && window.innerWidth < 500) {
        info.className = "info left";
    } else if (index % 3 == 2 && window.innerWidth < 500) {
        info.className = "info right";
    } else {
        info.className = "info";
    }

    if (index < 10) {
        info.innerText = `Computador ${index}\nMemória RAM: 16GB\nProcessador: Ryzen 5600g`
    } else {
        info.innerText = `Computador ${index}\nMemória RAM: 4GB\nProcessador: ???`
    }
    return info;
}

function addBtn(id) {
    let btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.innerText = "Agendar";
    btn.id = `btn_${id}`;
    btn.onclick = function () {
        document.getElementById("popup").style.display = "block";
        document.getElementById("title").innerText = `Agendamento para o computador ${id}`
        document.getElementById("popup").children[0].value = id
    }
    return btn;
}

function setItem(img, info, btn, index) {
    let item = document.createElement("div");
    item.className = "col-4 col-md-2";
    item.id = index;
    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(btn);
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
            let info = setInfo(index);
            let btn = addBtn(index);
            let item = setItem(img, info, btn, index);
            row.appendChild(item);
            index++;
        }
        document.getElementById("container0").appendChild(row);
    }


}

function submit() {
    let value = document.getElementById("popup").children[0].value
    console.log(value);
    document.getElementById(value).children[0].className += " red";
    document.getElementById(value).children[1].className += " red";
    document.getElementById(`btn_${value}`).disabled = true;
    document.getElementById("popup").style.display = "none";
}

window.addEventListener('load', generateComputers);

// fecha o popup quando clica fora dele
window.onclick = function (event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}