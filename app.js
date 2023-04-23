const form = document.querySelector('#form-despesa');
const tabela = document.querySelector('#tabela-despesas tbody');
let pg_apagar = 0;
let pg_pagas = 0;
let pg_atrasadas = 0;
let pg_total = 0
const dominio = "http://127.0.0.1:5000"
//const dominio = "https://finance-tati.onrender.com"

const getList = async () => {
  let url = dominio + '/despesas';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.despesas.forEach(item => {
        /*console.log(item);*/
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
  const id = row.insertCell(0);
  const descricaoCell = row.insertCell(1);
  const valorCell = row.insertCell(2);
  const vencimentoCell = row.insertCell(3);
  const pagoCell = row.insertCell(4);
  const acoesCell = row.insertCell(5);

  let botao_status = '';
  let estilo_pago = '';
  let texto = '';

  id.innerHTML = despesa.id;
  descricaoCell.innerHTML = despesa.descricao;
  valorCell.innerHTML = 'R$ ' + despesa.valor.toFixed(2);

  let data = despesa.data_vencimento
  let partes = data.split('/');

  let vencimento = new Date(partes[2], partes[1] - 1, partes[0]);
  let hoje = new Date();

  if (!despesa.pago) {
    if (vencimento < hoje) {
      botao_status = '<h3><span class="badge bg-atrasadas">Atrasada</span></h3>';
      estilo_pago = 'tblDelBtn';
      texto = 'Pagar';
    }
    else {
      botao_status = '<h3><span class="badge bg-apagar">A pagar</span></h3>';
      estilo_pago = 'tblDelBtn';
      texto = 'Pagar';
    }
  }
  else {
    botao_status = '<h3><span class="badge bg-pagas">Paga</span></h3>';
    estilo_pago = 'tblDelBtnu';
    texto = 'Desfazer Pagamento';
  }

  vencimentoCell.innerHTML = despesa.data_vencimento;
  pagoCell.innerHTML = botao_status;
  acoesCell.innerHTML = '<a href="#" class="tblDelBtne" title="Editar"><i id="edi">&#128393;</i></a><a href="#"  class=' + estilo_pago + ' title="' + texto + '">&nbsp; <i id="edit" >&nbsp;&#36;&nbsp;</i></a> <a href="#" class="tblDelBtnx" title="Excluir Despesa">&nbsp; <i id="exclur">&nbsp;X&nbsp;</i></a>';

  acoesCell.addEventListener('click', function (event) {
    console.log(event.target.innerText);
    if (event.target.tagName === 'I') {
      if (event.target.innerText == '\xa0\u0024\xa0') {
        marcarComoPaga(despesa);
      } else if (event.target.innerText === '\xa0X\xa0') {
        excluirDespesa(despesa);
      } else {
        console.log("chama editrow na exibir despesas");
        editRow(this, despesa);
      }
    }
  });


}

getList()

const postItem = async (inputDescricao, inpuValor, inputVencimento, inputPago) => {
  const formData = new FormData();
  formData.append('descricao', inputDescricao);
  formData.append('valor', inpuValor);
  formData.append('data_vencimento', inputVencimento);
  formData.append('pago', inputPago);

  let url = dominio + '/despesa';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      if (response.status == 409) {
        //alert("Despesa já existe");
        document.getElementById("alerta").innerHTML = "Despesa já existe";
      }
      const novaDespesa = {
        descricao: inputDescricao,
        valor: inpuValor,
        data_vencimento: inputVencimento,
        pago: inputPago
      };

      exibirDespesas(novaDespesa);
      somaSaldo(novaDespesa);
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
  let url = dominio + '/despesa?descricao=' + nomeItem;
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
  let url = dominio + '/paga?descricao=' + nomeItem;
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
  const total_apagar = document.querySelector('#total-apagar');
  const total_pagas = document.querySelector('#total-pagas');
  const total_atrasadas = document.querySelector('#total-atrasadas');

  total.textContent = pg_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  //total.className = 'saldo-negativo';

  total_apagar.textContent = pg_apagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  total_atrasadas.textContent = pg_atrasadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  //total_pend.className = 'saldo-negativo';
  total_pagas.textContent = pg_pagas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  //total_pago.className = 'saldo-positivo';
}

function somaSaldo(despesa) {

  let venc = despesa.data_vencimento
  let parte = venc.split('/');
  let venceu = new Date(parte[2], parte[1] - 1, parte[0]);
  let agora = new Date();

  if (!despesa.pago) {
    if (venceu < agora) {
      pg_atrasadas += despesa.valor
    } else {
      pg_apagar += despesa.valor;
    }
  }
  else {
    pg_pagas += despesa.valor;
  }
  pg_total = pg_pagas + pg_apagar + pg_atrasadas;
}
atualizarTotal();
form.addEventListener('submit', adicionarDespesa);

function editRow(btn, despesa) {
  var row = btn.parentNode;
  console.log(btn.parentNode);

  var cells = row.getElementsByTagName("td");

  Array.from(cells).forEach((cell, i) => {
    var value = cell.innerHTML;

    if (i == 0) {
      cell.innerHTML = "<input type='number' id='id_descricao' disabled value='" + value + "'/>";
    }
    else if (i == 1) {
      cell.innerHTML = "<input type='text' id='valor_descricao' value='" + value + "'/>";
    } else if (i == 2) {
      const input = document.querySelector('input[type="number"]');
      const valorSemCifrao = value.replace(/^R\$ /, '');
      cell.innerHTML = "<input type='number' step='0.01' min='0'  id='valor_real' value='" + valorSemCifrao + "'/>";
    } else if (i == 3) {

      var data = new Date(Date.parse(value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3")))
      var ano = data.getFullYear();
      var mes = ("0" + (data.getMonth() + 1)).slice(-2);
      var dia = ("0" + data.getDate()).slice(-2);
      var data_formatada = ano + "-" + mes + "-" + dia;
      cell.innerHTML = "<input type='date' id='valor_data' value='" + data_formatada + "'/>";

    } else if (i == 5) {
      cell.innerHTML = '<button id="salvar" class="form-section form button" type="submit">Salvar</button>';
      /*cell.innerHTML = '<a href="#" class="tblDelBtne" title="salvar"><i id="salvar">Salvar</i></a>';*/
    }
  });

  document.getElementById("salvar").addEventListener('click', function (event) {
    var inputs = row.getElementsByTagName("input");

    console.log("quantidade de inputs: " + inputs.length);
    var valores = [];

    for (var i = 0; i < inputs.length; i++) {
      valores.push(inputs[i].value);

      /*cells[i].innerHTML = inputs[i].value;*/
    }

    console.log("valores:", valores);
    salva_despesa(valores);
  });
}

function salva_despesa(valores) {

  console.log("valores após chamar função salva_despesa: " + valores);
  let id = valores[0];
  let descricao = valores[1];
  let valor = valores[2];
  let dataVencimento = valores[3];
  console.log("ID: " + id);
  console.log("descrição: " + descricao);
  console.log("Valor: " + valor);
  console.log("Vencimento: " + dataVencimento);


  let url = dominio + '/despesa?id=' + id + '&descricao=' + descricao + '&valor=' + valor + '&data_vencimento=' + dataVencimento;
  fetch(url, {
    method: 'put'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*retorno = postItem(id, descricao, valor, dataVencimento, paga)*/




