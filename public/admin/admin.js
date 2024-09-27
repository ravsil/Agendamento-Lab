function isAdmin(admins) {
    for (let i = 0; i < admins.length; i++) {
        if (admins[i].email == localStorage.getItem("email") && admins[i].ocupacao == "Professor") {
            document.getElementsByTagName("body")[0].style = "display: block !important;";
            return;
        }
    }
    window.location.href = "/agendalab";
}

function createButtons(parent, user) {
    let btn1 = document.createElement("button");
    btn1.className = "btn btn-primary";
    let desiredOcupation = (user.ocupacao == "Aluno") ? "Professor" : "Aluno";
    btn1.value = user.email;
    btn1.innerHTML = `<i class='fa-solid fa-user-pen'></i>&nbsp;&nbsp;Tornar ${desiredOcupation}`;
    btn1.onclick = function () {
        $.ajax({
            url: 'alter-occupation',
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
                alert(`[ERRO]!!! ${error.responseJSON.message}`);
            }
        });
        window.location.href = "admin";
    }
    parent.appendChild(btn1);

    let btn2 = document.createElement("button");
    btn2.className = "btn btn-danger";
    btn2.innerHTML = "<i class='fas fa-trash'></i>&nbsp;&nbsp;Excluir";
    btn2.value = user.email;
    btn2.onclick = function () {
        $.ajax({
            url: 'delete-user',
            type: 'POST',
            data: {
                email: user.email
                //email: encrypdetEmail
            },
            success: function (response) {
                alert(`Usuário ${user.email} removido!`);
            },
            error: function (error) {
                alert(`[ERRO]!!! ${error.responseJSON.message}`);
            }
        });
        window.location.href = "admin";
    }
    if (btn2.value == localStorage.getItem("email")) {
        btn2.disabled = true;
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

function agendar(email, start, end, day, desc) {
    $.ajax({
        url: 'schedule-class',
        type: 'POST',
        data: {
            email: email,
            start: start,
            end: end,
            date: day,
            description: desc
        },
        success: function (response) {
            alert("Aula adicionada com sucesso!")
            window.location.href = "admin";

        },
        error: function (error) {
            alert(`[ERRO]!!! ${error.responseJSON.message}`);
        }
    });
}

function submit() {
    let hora1 = document.getElementById("hora1").value;
    let hora2 = document.getElementById("hora2").value;
    let day = document.getElementById("dia").value;
    let desc = document.getElementById("descricao").value;

    $.ajax({
        url: 'get-class-admin',
        type: 'POST',
        data: {
            day: day
        },
        success: function (response) {
            let horarios = {};
            for (let i = 1; i <= 21; i++) {
                horarios[i] = true;
            }
            for (let i = 0; i < response.length; i++) {
                for (let k = response[i].id_inicio; k < response[i].id_fim; k++) {
                    horarios[k] = false
                }
            }
            let indisponivel = false;
            for (let i = getHourIndex(hora1); i < getHourIndex(hora2); i++) {
                if (!horarios[i]) {
                    indisponivel = true;
                    break;
                }
            }
            if (!horarios[getHourIndex(hora1)] || !horarios[getHourIndex(hora2)] || indisponivel) {
                alert("Já existe um agendamento neste horário")
            } else {
                agendar(localStorage.getItem("email"), getHourIndex(hora1), getHourIndex(hora2), day, desc);
            }

        },
        error: function (error) {
            alert(`[ERRO]!!! ${error.responseJSON.message}`);
        }
    });
}

function update() {
    let password = document.getElementById("update").value;

    $.ajax({
        url: 'update',
        type: 'POST',
        data: {
            password: password
        },
        success: function (response) {
            alert(response.message)
            window.location.href = "admin";

        },
        error: function (error) {
            alert(`[ERRO]!!! ${error.responseJSON.message}`);
        }
    });
}

$.getJSON("get-users", function (data) {
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

for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
    let days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];
    $.ajax({
        url: 'get-class-admin',
        type: 'POST',
        data: {
            day: days[dayIndex]
        },
        success: function (classes) {
            let classList = document.getElementById("classes");
            for (let i = 0; i < classes.length; i++) {
                let item = document.createElement("tr");

                let email = document.createElement("td");
                email.innerText = classes[i].email
                item.appendChild(email)

                let time = document.createElement("td");
                time.innerText = `${getIndexHour(classes[i].id_inicio)}-${getIndexHour(classes[i].id_fim)}`
                console.log(classes[i])
                item.appendChild(time)


                let weekDay = document.createElement("td");
                weekDay.innerText = days[dayIndex]
                item.appendChild(weekDay)

                let desc = document.createElement("td")
                desc.innerText = classes[i].descricao
                item.appendChild(desc)
                classList.appendChild(item)

                let td = document.createElement("td");
                td.className = "text-right";
                let delButton = document.createElement("button");
                delButton.className = "btn btn-danger";
                delButton.innerHTML = "<i class='fas fa-trash'></i>&nbsp;&nbsp;Excluir";
                delButton.onclick = function () {
                    $.ajax({
                        url: '/delete-class',
                        type: 'POST',
                        data: {
                            email: classes[i].email,
                            id_inicio: classes[i].id_inicio,
                            id_fim: classes[i].id_fim,
                            dia_semana: classes[i].dia_semana
                        },
                        success: function (response) {
                            alert(`Aula removida!`);
                        },
                        error: function (error) {
                            alert(`[ERRO]!!! ${error.responseJSON.message}`);
                        }
                    });
                    window.location.href = "/admin";
                }
                td.appendChild(delButton);
                item.appendChild(td)
            }
        },
        error: function (error) {
            alert(`[ERRO]!!! ${error.responseJSON.message}`);
        }
    });
}

window.addEventListener('load', createHours);