import sqlite3

def createDb(insertIntervals=False, insertPcs=False):
    # Conecta ao banco de dados (ou cria um novo se não existir)
    db = sqlite3.connect('agendamento.db')
    cursor = db.cursor()

    # Cria a tabela Usuario
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Usuario (
            email VARCHAR(255) PRIMARY KEY NOT NULL,
            ocupacao VARCHAR(20) NOT NULL
        )
    ''')

    # Cria a tabela Computador
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Computador (
            patrimonio INT(20) PRIMARY KEY NOT NULL,
            processador VARCHAR(20) NOT NULL,
            placa_de_video VARCHAR(20) NOT NULL,
            qtd_memoria_ram INT(3) NOT NULL
        )
    ''')

    # Cria a tabela Intervalo
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Intervalo (
            id_tempo INTEGER PRIMARY KEY AUTOINCREMENT,
            tempo VARCHAR(10) NOT NULL
        )
    ''')

    # Cria a tabela Agendamento
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Agendamento (
            id_Agendamento INTEGER PRIMARY KEY AUTOINCREMENT,
            computador_patrimonio INT(20) NOT NULL,
            email VARCHAR(255) NOT NULL,
            id_inicio INT(2) NOT NULL,
            id_fim INT(2) NOT NULL,
            data VARCHAR(10) NOT NULL,
            FOREIGN KEY (computador_patrimonio) REFERENCES Computador (patrimonio),
            FOREIGN KEY (email) REFERENCES Usuario (email),
            FOREIGN KEY (id_inicio) REFERENCES Intervalo (id_tempo),
            FOREIGN KEY (id_fim) REFERENCES Intervalo (id_tempo)
        )
    ''')

    # Cria a tabela Aula
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Aula (
            email VARCHAR(50) NOT NULL, 
            id_inicio INTEGER NOT NULL, 
            id_fim INTEGER NOT NULL, 
            dia_semana VARCHAR(30),
            descricao VARCHAR(50),
            ativo INTEGER NOT NULL,
            FOREIGN KEY (email) REFERENCES Usuario (email),
            FOREIGN KEY (id_inicio) REFERENCES Intervalo (id_tempo), 
            FOREIGN KEY (id_fim) REFERENCES Intervalo (id_tempo))
    ''')

    # Insere intervalos de tempo
    if insertIntervals:
        intervals = []
        for hour in range(8, 18):
            intervals.append(f'{hour}:00')
            intervals.append(f'{hour}:30')
        intervals.append('18:00')

        stmt = db.cursor()
        for interval in intervals:
            stmt.execute('INSERT INTO Intervalo (tempo) VALUES (?)', (interval,))
    
    if insertPcs:
        for i in range(30):
            if(i < 10):                    
                cursor.execute("INSERT INTO Computador(patrimonio, processador, placa_de_video, qtd_memoria_ram) VALUES (?, 'Ryzen 5 5600G', 'Integrada', 16)", [i])
            else:
                cursor.execute("INSERT INTO Computador(patrimonio, processador, placa_de_video, qtd_memoria_ram) VALUES (?, 'Intel Core i3 4100M', 'Integrada', 4)", [i])

    db.commit()
    if insertIntervals:
        stmt.close()
    cursor.close()
    db.close()

if __name__ == "__main__":
    createDb(True, True)