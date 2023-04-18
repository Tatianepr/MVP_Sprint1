const form = document.querySelector('#form-despesa');
const tabela = document.querySelector('#tabela-despesas tbody');
let pg_pendente = 0;
let pg_pago = 0;

const getList = async () => {
  let url = 'http://127.0.0.1:5000/despesas';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.despesas.forEach(item => {
        exibirDespesas(item);
        somaSaldo(item.valor, item.pago);
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
  vencimentoCell.innerHTML = despesa.data_vencimento;
  /*pagoCell.innerHTML = `<input type="checkbox" ${despesa.pago ? 'checked' : ''}>`;
  pagoCell.innerHTML = `<img id="pagou" ${despesa.pago ? 'src="img/check.png"' : 'src="img/warn.png"'}>`;
  excluirCell.innerHTML = '<img id="exclui" class="exclusao" src="img/excluir_preto.png" alt="Botão de lixeira">';*/

  pagoCell.innerHTML = `<a href="#"><img id="pagou" ${despesa.pago ? 'src="img/check.png"' : 'src="img/warn.png"'}></a>`;
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
      somaSaldo(novaDespesa.valor, novaDespesa.pago);
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
  let url = 'http://127.0.0.1:5000/atualiza?descricao=' + nomeItem;
  fetch(url, {
    method: 'get'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

function marcarComoPaga(nomeItem) {
  pagaitem(nomeItem.descricao);
  /*exibirDespesas(nomeItem);*/
  somaSaldo(nomeItem.valor, nomeItem.pago);
}

function atualizarTotal() {
  const total = document.querySelector('#total');
  const total_pago = document.querySelector('#total-pago');
  total.textContent = pg_pendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total.className = 'saldo-negativo';
  total_pago.textContent = pg_pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total_pago.className = 'saldo-positivo';
}

function somaSaldo(valor, pago) {
  if (!pago) {
    pg_pendente += valor;
  }
  else {
    pg_pago += valor;
  }
}
atualizarTotal();
form.addEventListener('submit', adicionarDespesa);
