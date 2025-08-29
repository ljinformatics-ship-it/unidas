// Para rodar este código, você precisa instalar o Express: npm install express body-parser
const express = require('express');
const fs = require('fs'); // Módulo nativo para manipulação de arquivos
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = 'carros.json';

app.use(bodyParser.json());

// Permite que sua página web acesse este servidor
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permite acesso de qualquer origem
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Rota para obter todos os carros
app.get('/carros', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler os dados.');
        }
        res.json(JSON.parse(data));
    });
});

// Rota para adicionar um novo carro
app.post('/carros', (req, res) => {
    const novoCarro = req.body;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler os dados.');
        }
        const carros = JSON.parse(data);
        carros.push(novoCarro);
        fs.writeFile(DATA_FILE, JSON.stringify(carros, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar os dados.');
            }
            res.status(201).json(novoCarro);
        });
    });
});

// Rota para remover um carro
app.delete('/carros/:placa', (req, res) => {
    const placaParaRemover = req.params.placa;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler os dados.');
        }
        let carros = JSON.parse(data);
        const carroRemovido = carros.find(carro => carro.placa === placaParaRemover);
        if (!carroRemovido) {
            return res.status(404).send('Carro não encontrado.');
        }
        carros = carros.filter(carro => carro.placa !== placaParaRemover);
        fs.writeFile(DATA_FILE, JSON.stringify(carros, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar os dados.');
            }
            res.status(200).json(carroRemovido);
        });
    });
});

// Rota para transferir um carro entre pisos
app.put('/carros/:placa', (req, res) => {
    const placaParaTransferir = req.params.placa;
    const novoPiso = req.body.piso;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler os dados.');
        }
        const carros = JSON.parse(data);
        const carro = carros.find(c => c.placa === placaParaTransferir);
        if (!carro) {
            return res.status(404).send('Carro não encontrado.');
        }
        carro.piso = novoPiso;
        fs.writeFile(DATA_FILE, JSON.stringify(carros, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar os dados.');
            }
            res.status(200).json(carro);
        });
    });
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
