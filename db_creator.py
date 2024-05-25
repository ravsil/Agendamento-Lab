import sqlite3
import sqlite3

def createDb():
    db = sqlite3.connect('agendamento.db')
    cursor = db.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS Ocupacoes (id_ocupacao INTEGER PRIMARY KEY AUTOINCREMENT, ocupacao VARCHAR(20) NOT NULL)");
    cursor.execute("CREATE TABLE IF NOT EXISTS Usuario (email VARCHAR(255) NOT NULL PRIMARY KEY, id_ocupacao INT NOT NULL, FOREIGN KEY (id_ocupacao) REFERENCES Ocupacoes(id_ocupacao))");
    cursor.execute("CREATE TABLE IF NOT EXISTS Computador (patrimonio INT NOT NULL PRIMARY KEY, processador VARCHAR(20) NOT NULL, placa_de_video VARCHAR(20) NOT NULL, qtd_memoria_ram INT NOT NULL)");
    cursor.execute("CREATE TABLE IF NOT EXISTS Agendamento (id_agendamento INTEGER PRIMARY KEY AUTOINCREMENT, computador_patrimonio INT NOT NULL, email VARCHAR(255) NOT NULL, intervalo_tempo VARCHAR(10) NOT NULL, data VARCHAR(10), FOREIGN KEY (computador_patrimonio) REFERENCES Computador(patrimonio), FOREIGN KEY (email) REFERENCES Usuario(email))");
    for i in range(30):
       if(i < 10):
           cursor.execute("INSERT INTO Computador(patrimonio, processador, placa_de_video, qtd_memoria_ram) VALUES (?, 'Ryzen 5 5600G', 'Integrada', 16)", [i])
       else:
           cursor.execute("INSERT INTO Computador(patrimonio, processador, placa_de_video, qtd_memoria_ram) VALUES (?, 'Intel Core i3 4100M', 'Integrada', 4)", [i])
    
    db.commit()

if __name__ == "__main__":
    createDb()
