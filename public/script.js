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
    img.setAttribute("src", "https://cdn.glitch.global/da38d8b0-49b0-446f-95c2-2967b36af762/pc.png?v=1714602850340");
    img.className = "img-fluid grower";
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
    $.getJSON("/get-computers", function (data) {
      let computers = data;
      document.getElementById("txt-Principal").innerText += ` (${getDate()})`
    let index = 0
    for (let i = 0; i < 4; i++) {
        let row = document.createElement("div");
        row.className = "row mb-5 mt-5 justify-content-around";
        for (let j = 0; j < 6; j++) {
            let img = setImage();
            let info = setInfo(computers[i*6 + j]);
            let btn = addBtn(computers[i*6 + j].patrimonio);
            let item = setItem(img, info, btn, computers[i*6 + j].patrimonio);
            row.appendChild(item);
        }
        document.getElementById("container0").appendChild(row);
    }
    });


}

function submit() {
    let value = document.getElementById("popup").children[0].value
    let hora = JSON.parse(document.getElementById("value_hora").value)
    document.getElementById("popup").style.display = "none";
    document.getElementById(`btn_${value}`).disabled = true;
    let horario = "";
    if (hora < 10) {
        horario = "0" + hora.toString()
        hora = (hora == 9) ? "10" : "0" + (hora + 1).toString()
    } else {
        horario = hora.toString()
        hora = (hora + 1).toString()
    }
    horario += "h"
    let minuto = JSON.parse(document.getElementById("value_minuto").value)
    if (minuto < 10) {
        horario += "0" + minuto.toString()
        minuto = (minuto == 9) ? "10" : (minuto + 1).toString()
    } else {
        horario += minuto.toString()
        minuto = (minuto).toString()
    }
    horario += `-${hora}h${minuto}`

    $.getJSON("/get-file", function (data) {
        let agendamentos = data;
        agendamentos[value].horarios.push(horario);
        agendamentos[value].users.push(localStorage.getItem("email"));
        
      
        $.post("/save-file", {"body": JSON.stringify(agendamentos)}, function (response) {
            console.log(response);
        });
        update();
    });
    
    alert(`Computador ${value} agendado para o horário de ${horario}`)
}

function hasScheduled() {
  for (let i = 0; i < 24; i++) {
}
  return false;
}

window.addEventListener('load', generateComputers);

window.addEventListener('load', function () {
    let time = new Date().getTime();
    if (JSON.parse(localStorage.getItem("time")) + 1000 * 60 * 60 * 8 < time) {
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("time");
    };

    let name = localStorage.getItem("name");

    if (name != null) {
        document.getElementById("hello").innerText = `Olá ${name}!`;
        let loginLink = document.getElementById("login-link")
        loginLink.parentNode.removeChild(loginLink)
    } else {
        for (let i = 0; i < 24; i++) {
            let element = document.getElementById(i);
            document.getElementById(`btn_${i}`).disabled = true;
        }
    }
})

// fecha o popup quando clica fora dele
window.onclick = function (event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}

