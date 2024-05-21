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
                let info = setInfo(computers[i * 6 + j]);
                let btn = addBtn(computers[i * 6 + j].patrimonio);
                let item = setItem(img, info, btn, computers[i * 6 + j].patrimonio);
                row.appendChild(item);
            }
            document.getElementById("container0").appendChild(row);
        }
    });
    update();
}

function submit() {
    let horas = {
        '08:00': 0,
        '08:30': 1,
        '09:00': 2,
        '09:30': 3,
        '10:00': 4,
        '10:30': 5,
        '11:00': 6,
        '11:30': 7,
        '12:00': 8,
        '12:30': 9,
        '13:00': 10,
        '13:30': 11,
        '14:00': 12,
        '14:30': 13,
        '15:00': 14,
        '15:30': 15,
        '16:00': 16,
        '16:30': 17,
        '17:00': 18,
        '17:30': 19,
        '18:00': 20,
    }
    //let hora1 = horas[document.getElementById("hora1").value];
    //let hora2 = horas[document.getElementById("hora2").value];
    let value = document.getElementById("popup").children[0].value
    let hora1 = document.getElementById("hora1").value.replace(":", "h");
    let hora2 = document.getElementById("hora2").value.replace(":", "h");
    let horario = `${hora1}-${hora2}`

    document.getElementById("popup").style.display = "none";

    let wrong = true
    let users;
    let agendamentos;
    $.getJSON("/get-users", function (data) {
        users = data;
    });
    $.getJSON("/get-file", function (data) {
        agendamentos = data;
    });
    // let email;
    // $.getJSON("/get-key", function (key) {
    //     email = CryptoJS.AES.decrypt(encryptedData, key.key).toString(CryptoJS.enc.Utf8);
    // });
    for (let i = 0; i < users.length; i++) {
        // if (users[i].email == email) {
        if (users[i].email == localStorage.getItem("email")) {
            document.getElementById(`btn_${value}`).disabled = true;
            agendamentos[value].horarios.push(horario);
            agendamentos[value].users.push(localStorage.getItem("email"));
            console.log("agendamentos", agendamentos);

            $.post("/save-file", { "body": JSON.stringify(agendamentos) }, function (response) {
                console.log(response);
            });
            update();
            wrong = false
            alert(`Computador ${value} agendado para o horário de ${horario}`)
            return
        }
    }
    if (wrong) alert("Usuário inválido!")

}

function logout() {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("time");
}

function createHours() {
    let hora1 = document.getElementById("hora1")
    let curHour = new Date().getHours();
    let hourOffset = (curHour - 8 > 0) ? curHour - 8 : 0;
    let curMin = new Date().getMinutes();
    let minOffset = (curMin > 30) ? 30 : 0;
    for (let hour = 8 + hourOffset; hour <= 17; hour++) {
        for (let min = 0 + minOffset; min < 60; min += 30) {
            let formattedHour = ("0" + hour).slice(-2);
            let formattedMin = ("0" + min).slice(-2);
            let element = document.createElement("option");
            element.setAttribute("value", `${formattedHour}:${formattedMin}`);
            element.innerText = `${formattedHour}:${formattedMin}`;
            hora1.appendChild(element);
        }
        minOffset = 0;
    }

}

function updateHoraFinal() {
    // remove a opção vazia
    let hora1 = document.getElementById("hora1")
    let empty = hora1.querySelector('option[value=""]');
    if (empty) {
        hora1.removeChild(empty);
    }

    let hora1Value = hora1.value;
    let hora2Select = document.getElementById("hora2");
    hora2Select.disabled = false;
    hora2Select.innerHTML = ''; // Limpar as opções atuais

    let hora1Hour = parseInt(hora1Value.split(':')[0]);
    let hora1Min = parseInt(hora1Value.split(':')[1]);

    // Adicionar opções para o segundo select começando após o horário selecionado no primeiro select
    for (let hour = hora1Hour; hour <= 17; hour++) {
        for (let min = (hour == hora1Hour ? hora1Min + 30 : 0); min < 60; min += 30) {
            let formattedHour = ("0" + hour).slice(-2);
            let formattedMin = ("0" + min).slice(-2);
            hora2Select.innerHTML += `<option value="${formattedHour}:${formattedMin}">${formattedHour}:${formattedMin}</option>`;
        }
    }
    // Último horário
    hora2Select.innerHTML += `<option value="18:00">18:00</option>`;
}

window.addEventListener('load', generateComputers);
window.addEventListener('load', createHours);

window.addEventListener('load', function () {
    let time = new Date().getTime();
    if (JSON.parse(localStorage.getItem("time")) + 1000 * 60 * 60 * 8 < time) {
        logout();
    };

    let name = localStorage.getItem("name");

    if (name != null) {
        document.getElementById("hello").innerText = `Olá ${name}!`;
        let loginLink = document.getElementById("login-link")
        loginLink.parentNode.removeChild(loginLink)
    } else {
        let logoutLink = document.getElementById("logout-link")
        logoutLink.parentNode.removeChild(logoutLink)
    }
})

// fecha o popup quando clica fora dele
window.onclick = function (event) {
    if (event.target == document.getElementById("popup")) {
        document.getElementById("popup").style.display = "none";
    }
}