function isAdmin(admins) {
    for (let i = 0; i < admins.length; i++) {
        if (admins[i].email == localStorage.getItem("email") && admins[i].ocupacao == "Professor") {
            document.getElementsByTagName("body")[0].style.display = "block";
            return;
        }
    }
    window.location.href = "/";
}

function createButtons(parent, user) {
    let btn1 = document.createElement("button");
    btn1.className = "btn btn-primary";
    let desiredOcupation = (user.ocupacao == "Aluno") ? "Professor" : "Aluno";
    console.log(desiredOcupation)
    btn1.value = user.email;
    btn1.innerHTML = `<i class='fa-solid fa-user-pen'></i>&nbsp;&nbsp;Tornar ${desiredOcupation}`;
    btn1.onclick = function () {
        $.ajax({
            url: '/alter-occupation',
            type: 'POST',
            data: {
                email: user.email,
                ocupation: desiredOcupation
                //email: encrypdetEmail
            },
            success: function (response) {
                alert(`O usuário agora é ${desiredOcupation}`);
            },
            error: function (error) {
                alert(`[ERRO]!!! ${error}`);
            }
        });
        window.location.href = "/admin";
    }
    parent.appendChild(btn1);

    let btn2 = document.createElement("button");
    btn2.className = "btn btn-danger";
    btn2.innerHTML = "<i class='fas fa-trash'></i>&nbsp;&nbsp;Excluir";
    btn2.value = user.email;
    btn2.onclick = function () {
        alert("Usuário excluído com falha! Ainda não foi implementado");
    }
    parent.appendChild(btn2);
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

$.getJSON("/get-users", function (data) {
    let users = data;
    isAdmin(users);

    let userList = document.getElementById("users");
    for (let i = 0; i < users.length; i++) {
        let item = document.createElement("tr");

        let email = document.createElement("td");
        email.innerText = users[i].email
        item.appendChild(email)

        let ocupation = document.createElement("td");
        ocupation.innerText = users[i].ocupacao
        console.log(users[i])
        item.appendChild(ocupation)

        let td = document.createElement("td");
        td.className = "text-right";
        let btnDiv = document.createElement("div");
        btnDiv.className = "btn-group";
        btnDiv.role = "group";
        createButtons(btnDiv, users[i]);
        td.appendChild(btnDiv);
        item.appendChild(td);
        userList.appendChild(item)
    }
});

window.addEventListener('load', createHours);