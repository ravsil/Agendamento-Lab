function setImage(index) {
    let img = document.createElement("img");
    img.setAttribute("src", "https://cdn.glitch.global/da38d8b0-49b0-446f-95c2-2967b36af762/pc.png?v=1714602850340");
    img.className = "img-fluid grower";
    img.onclick = function () {
        window.location.href = `disponibilidade?pc=${index}`
    }
    return img;
}

function setInfo(pc) {
    let info = document.createElement("div");

    // jeito feio de arrumar os elementos no mobile
    if (pc.patrimonio % 3 == 0 && window.innerWidth < 500) {
        info.className = "info left";
    } else if (pc.patrimonio % 3 == 2 && window.innerWidth < 500) {
        info.className = "info right";
    } else {
        info.className = "info";
    }
    info.innerText = `Computador ${pc.patrimonio}\nMemória RAM: ${pc.qtd_memoria_ram}\nProcessador: ${pc.processador}`
    return info;
}

function addBtn(id) {
    let btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.innerText = "Agendar";
    btn.id = `btn_${id}`;
    if (localStorage.getItem("name") == null) {
        btn.disabled = true
    }
    btn.onclick = function () {
        document.getElementById("popup").style.display = "block";
        document.getElementById("title").innerText = `Agendamento para o Computador ${id}`
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
    return item;
}