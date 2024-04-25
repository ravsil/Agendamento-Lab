// muito feioso, eu sei, mas é provisório. Só pra testar
let currentMinute = new Date().getMinutes();
let first = true

function runOnOddMinute() {
    const minute = new Date().getMinutes();
    let title = document.getElementById("txt-Principal")
    if ((minute % 2 !== 0 && minute != currentMinute) || first) {
        if (first) {
            first = false;
        }
        currentMinute = minute;
        title.innerText = `${title.innerText}\n(Em aula)`
        alert("Em aula");
        for (let i = 0; i < 24; i++) {
            let element = document.getElementById(i);
            element.children[0].classList.remove("red");
            element.children[1].classList.remove("red");
            element.children[0].className += " yellow";
            element.children[1].className += " yellow";
            document.getElementById(`btn_${i}`).disabled = true;
        }
    } else if (minute != currentMinute) {
        currentMinute = minute;
        title.innerText = title.innerText.replace("\n(Em aula)", "")
        for (let i = 0; i < 24; i++) {
            let element = document.getElementById(i);
            element.children[0].classList.remove("yellow");
            element.children[1].classList.remove("yellow");
            document.getElementById(`btn_${i}`).disabled = false;
        }
    }
}


if (new Date().getMinutes() % 2 !== 0) {
    // da um tempo pra página carregar
    setTimeout(() => { runOnOddMinute() }, 20);
}
let seconds = new Date().getSeconds();
setInterval(runOnOddMinute, 60000 - seconds * 1000);