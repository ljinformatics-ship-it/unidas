const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const CARROS_FILE = path.join(__dirname, 'carros.json');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

function readCarros() {
    try {
        const data = fs.readFileSync(CARROS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo de carros:', error);
        return [];
    }
}

function writeCarros(carros) {
    try {
        fs.writeFileSync(CARROS_FILE, JSON.stringify(carros, null, 2), 'utf8');
    } catch (error) {
        console.error('Erro ao escrever no arquivo de carros:', error);
    }
}

app.get('/carros', (req, res) => {
    const carros = readCarros();
    res.json(carros);
});

app.post('/carros', (req, res) => {
    const { placa, piso, horaEntrada } = req.body;
    const carros = readCarros();

    const placaExiste = carros.some(carro => carro.placa.toUpperCase() === placa.toUpperCase());
    if (placaExiste) {
        return res.status(409).json({ message: 'Placa já cadastrada.' });
    }

    carros.push({ placa, piso, horaEntrada });
    writeCarros(carros);
    res.status(201).json({ message: 'Carro adicionado com sucesso!' });
});

app.put('/carros/:placa', (req, res) => {
    const placa = req.params.placa.toUpperCase();
    const { piso } = req.body;
    const carros = readCarros();

    const carroIndex = carros.findIndex(carro => carro.placa.toUpperCase() === placa);
    if (carroIndex === -1) {
        return res.status(404).json({ message: 'Carro não encontrado.' });
    }

    carros[carroIndex].piso = piso;
    writeCarros(carros);
    res.json({ message: 'Carro transferido com sucesso!' });
});

app.delete('/carros/:placa', (req, res) => {
    const placa = req.params.placa.toUpperCase();
    const carros = readCarros();

    const newCarros = carros.filter(carro => carro.placa.toUpperCase() !== placa);
    if (newCarros.length === carros.length) {
        return res.status(404).json({ message: 'Carro não encontrado.' });
    }

    writeCarros(newCarros);
    res.json({ message: 'Carro removido com sucesso!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});