const form = document.querySelector('#form-despesa');
const tabela = document.querySelector('#tabela-despesas tbody');

const getList = async () => {
  let url = 'http://127.0.0.1:5000/despesas';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.despesas.forEach(item => exibirDespesas(item))
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
  pagoCell.innerHTML = `<input type="checkbox" ${despesa.pago ? 'checked' : ''}>`;
  excluirCell.innerHTML = '<button class="excluir">Excluir</button>';

  excluirCell.addEventListener('click', function () {
    excluirDespesa(despesa.descricao);
  });

  pagoCell.addEventListener('change', function () {
    marcarComoPaga(despesa.descricao);
  });

}



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
    .then((response) => response.json())
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

  postItem(descricao, valor, dataVencimento, paga)

  /* exibirDespesas();
   form.reset();*/
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
    deleteItem(nomeItem);
    exibirDespesas();
    alert("Removido!")
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
  pagaitem(nomeItem);
  exibirDespesas();
}

form.addEventListener('submit', adicionarDespesa);