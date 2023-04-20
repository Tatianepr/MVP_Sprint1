const form = document.querySelector('#form-despesa');
const tabela = document.querySelector('#tabela-despesas tbody');
let pg_pendente = 0;
let pg_pago = 0;
let pg_vencidas = 0;

const getList = async () => {
  let url = 'http://127.0.0.1:5000/despesas';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.despesas.forEach(item => {
        exibirDespesas(item);
        somaSaldo(item);
      });
      atualizarTotal();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

const exibirDespesas = (despesa) => {

  const row = tabela.insertRow();
  const descricaoCell = row.insertCell(0);
  const valorCell = row.insertCell(1);
  const vencimentoCell = row.insertCell(2);
  const pagoCell = row.insertCell(3);
  const excluirCell = row.insertCell(4);

  descricaoCell.innerHTML = despesa.descricao;
  valorCell.innerHTML = 'R$ ' + despesa.valor.toFixed(2);

  let data = despesa.data_vencimento
  let partes = data.split('/');

  let vencimento = new Date(partes[2], partes[1] - 1, partes[0]);
  let hoje = new Date();


  if ((vencimento < hoje) && (!despesa.pago)) {
    row.classList.add('vencida');
  }

  vencimentoCell.innerHTML = despesa.data_vencimento;
  pagoCell.innerHTML = `<a href="#"><img id="pagou-${despesa.descricao}" class="pago-img" ${despesa.pago ? 'src="img/ok.png"' : 'src="img/not-ok.png"'}></a>`;
  excluirCell.innerHTML = '<a href="#"><img class="exclusao" src="img/excluir_preto.png" alt="Botão de lixeira"></a>';

  excluirCell.addEventListener('click', function () {
    excluirDespesa(despesa);
  });

  pagoCell.addEventListener('click', function () {
    marcarComoPaga(despesa);
  });

}

getList()

const postItem = async (inputDescricao, inpuValor, inputVencimento, inputPago) => {
  const formData = new FormData();
  formData.append('descricao', inputDescricao);
  formData.append('valor', inpuValor);
  formData.append('data_vencimento', inputVencimento);
  formData.append('pago', inputPago);

  let url = 'http://127.0.0.1:5000/despesa';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      if (response.status == 409) {
        alert("Já existe");
      }
      const novaDespesa = {
        descricao: descricao,
        valor: valor,
        data_vencimento: dataVencimento,
        pago: paga
      };

      exibirDespesas(novaDespesa);
      somaSaldo(novaDespesa.valor, novaDespesa.pago, novaDespesa.data_vencimento);
      form.reset();
      return response.json()
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


function adicionarDespesa(evento) {
  evento.preventDefault();

  let descricao = document.querySelector('#descricao').value;
  let valor = parseFloat(document.querySelector('#valor').value);
  let dataVencimento = document.querySelector('#data-vencimento').value;
  let paga = false

  retorno = postItem(descricao, valor, dataVencimento, paga)
}


const deleteItem = (nomeItem) => {
  console.log(nomeItem)
  let url = 'http://127.0.0.1:5000/despesa?descricao=' + nomeItem;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

function excluirDespesa(nomeItem) {
  if (confirm("Você tem certeza?")) {
    deleteItem(nomeItem.descricao);
    /*exibirDespesas(nomeItem);*/
    const celulas = document.querySelectorAll('td');
    celulas.forEach((celula) => {
      if (celula.textContent === nomeItem.descricao) {
        const linha = celula.parentNode;
        linha.parentNode.removeChild(linha);
      }
    });
  }

}

const pagaitem = (nomeItem) => {
  console.log(nomeItem)
  let url = 'http://127.0.0.1:5000/despesa?descricao=' + nomeItem;
  fetch(url, {
    method: 'put'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

function marcarComoPaga(nomeItem) {
  pagaitem(nomeItem.descricao);
  somaSaldo(nomeItem);

  const pago = nomeItem.pago;
  nomeItem.pago = !pago;
  const pagoImg = document.querySelector(`#pagou-${nomeItem.descricao}`);
  if (pagoImg) {
    pagoImg.src = nomeItem.pago ? 'img/ok.png' : 'img/not-ok.png';
  }
}

function atualizarTotal() {
  const total = document.querySelector('#total');
  const total_pago = document.querySelector('#total-pago');
  const total_pend = document.querySelector('#total-pend');
  total.textContent = pg_pendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total.className = 'saldo-negativo';
  total_pend.textContent = pg_vencidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total_pend.className = 'saldo-negativo';
  total_pago.textContent = pg_pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total_pago.className = 'saldo-positivo';
}

function somaSaldo(despesa) {

  let venc = despesa.data_vencimento
  let parte = venc.split('/');
  let venceu = new Date(parte[2], parte[1] - 1, parte[0]);
  let agora = new Date();

  if (!despesa.pago) {
    if (venceu < agora) {
      pg_vencidas += despesa.valor
    } else {
      pg_pendente += despesa.valor;
    }
  }
  else {
    pg_pago += despesa.valor;
  }
}
atualizarTotal();
form.addEventListener('submit', adicionarDespesa);

