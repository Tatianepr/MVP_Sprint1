let pg_apagar = 0;
let pg_pagas = 0;
let pg_atrasadas = 0;
let pg_total = 0
//const dominio = "http://127.0.0.1:5000"
const dominio = "https://finance-tati.onrender.com"
const form = document.querySelector('#form-despesa');
const tabela = document.querySelector('#tabela-despesas tbody');


const getList = async () => {
  let url = dominio + '/despesas';
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

const getCategorias = async () => {

  let url = dominio + '/categorias';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.categorias.forEach(item => {
        exibirCategorias(item);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

const exibirCategorias = (categoria) => {
  const selectCategoria = document.querySelector('#form-despesa select[id="categoria"]');
  const option = document.createElement('option');
  option.value = categoria.id;
  option.textContent = categoria.nome;
  selectCategoria.appendChild(option);

}
/*
function EditCategorias(nome) {
  let url = dominio + '/categorias';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.categorias.forEach(item => {
        var option = document.createElement("option");
        option.text = item.texto;
        option.valeu = item.id;
        if (nome == option.text) {
          option.selected = true;
        }
        document.getElementById("valor_categoria").appendChild(option)
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
*/
function statusPago(status, data) {
  let vencimento = data;
  let pago = status
  let hoje = new Date();

  if (!pago) {
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
  let retorno = [botao_status, estilo_pago, texto]
  return (retorno);
}

const exibirDespesas = (despesa) => {

  var row = tabela.insertRow();
  var id = row.insertCell(0);
  var descricaoCell = row.insertCell(1);
  var categoriaCell = row.insertCell(2)
  var valorCell = row.insertCell(3);
  var vencimentoCell = row.insertCell(4);
  var pagoCell = row.insertCell(5);
  var acoesCell = row.insertCell(6);
  var acoesCell2 = row.insertCell(7);

  let botao_status = '';
  let estilo_pago = '';
  let texto = '';

  id.innerHTML = despesa.id;
  descricaoCell.innerHTML = despesa.descricao;
  categoriaCell.innerHTML = despesa.categoria_nome;

  var valorFormatado = Number(despesa.valor.toFixed(2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  valorCell.innerHTML = valorFormatado;

  let data = despesa.data_vencimento
  let partes = data.split('/');

  let vencimento = new Date(partes[2], partes[1] - 1, partes[0]);
  let hoje = new Date();

  let estilopago = statusPago(despesa.pago, vencimento);
  botao_status = estilopago[0];
  estilo_pago = estilopago[1];
  texto = estilopago[2];

  vencimentoCell.innerHTML = despesa.data_vencimento;
  pagoCell.innerHTML = botao_status;

  var linkEditar = '<a href="#" class="tblDelBtne" title="Editar"><i id="edi">&#128393;</i></a>';
  var linkPagamento = '<a href="#"  id="pagou-"' + despesa.descricao + ' class=' + estilo_pago + ' title="' + texto + '">&nbsp; <i id="edit" >&nbsp;&#36;&nbsp;</i></a>';
  var linkExcluir = '<a href="#" class="tblDelBtnx" title="Excluir Despesa">&nbsp; <i id="exclur">&nbsp;X&nbsp;</i></a>';

  acoesCell.innerHTML = linkEditar + linkPagamento + linkExcluir;
  acoesCell2.innerHTML = '';

  acoesCell.addEventListener('click', function (event) {
    if (event.target.tagName === 'I') {
      if (event.target.innerText == '\xa0\u0024\xa0') {
        let botaoPagamento = event.target.parentElement;
        botaoPagamento.classList.toggle('tblDelBtn');
        botaoPagamento.classList.toggle('tblDelBtnu');
        despesa.pago = !despesa.pago;
        pagoCell.innerHTML = statusPago(despesa.pago, vencimento)[0];
        marcarComoPaga(despesa);
      } else if (event.target.innerText === '\xa0X\xa0') {
        excluirDespesa(despesa);
      } else {
        editRow(this, despesa);
      }
    }
  });


}

const postItem = async (inputDescricao, inputCategoria, inpuValor, inputVencimento, inputPago) => {
  const formData = new FormData();
  formData.append('descricao', inputDescricao);
  formData.append('categoria_id', inputCategoria);
  formData.append('valor', inpuValor);
  formData.append('data_vencimento', inputVencimento);
  formData.append('pago', inputPago);

  console.log("nova categoria recebida: ", inputCategoria);
  console.log(formData);

  let url = dominio + '/despesa';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      if (response.status == 409) {
        document.getElementById("alerta").innerHTML = "Despesa já existe";
      } else {
        response.json().then((data) => {
          const novaDespesa = data;
          /*{
            id: data.id,
            descricao: data.descricao,
            categoria_nome: data.categoria_nome,
            valor: data.valor,
            data_vencimento: data.data_vencimento,
            pago: data.pago
          };*/
          console.log(novaDespesa);
          exibirDespesas(novaDespesa);
          somaSaldo(novaDespesa);
          form.reset();
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


function adicionarDespesa(evento) {
  evento.preventDefault();

  let descricao = document.querySelector('#descricao').value;
  let categoria = document.querySelector("#categoria option:checked").value;
  let valor = parseFloat(document.querySelector('#valor').value);
  let dataVencimento = document.querySelector('#data-vencimento').value;
  let paga = false

  console.log("nova categoria escolhida: " + categoria)

  retorno = postItem(descricao, categoria, valor, dataVencimento, paga)
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
  /*location.reload();*/
}

function atualizarTotal() {

  const total = document.querySelector('#total');
  const total_apagar = document.querySelector('#total-apagar');
  const total_pagas = document.querySelector('#total-pagas');
  const total_atrasadas = document.querySelector('#total-atrasadas');

  total.textContent = pg_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total_apagar.textContent = pg_apagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total_atrasadas.textContent = pg_atrasadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  total_pagas.textContent = pg_pagas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

function editRow(btn, despesa) {
  var row = btn.parentNode;
  var cells = row.getElementsByTagName("td");
  Array.from(cells).forEach((cell, i) => {
    var value = cell.innerHTML;
    if (i == 0) {
      cell.innerHTML = "<label>" + value + "</label><input type='hidden' id='id_descricao' disabled value='" + value + "'/>";
    }
    else if (i == 1) {
      cell.innerHTML = "<input type='text' id='valor_descricao' value='" + value + "'/>";
    } else if (i == 2) {
      /*ver como colocar o ID da categoria aqui*/
      cell.innerHTML = "<select id='valor_categoria'></select>"

      let url = dominio + '/categorias';
      fetch(url, {
        method: 'get',
      })
        .then((response) => response.json())
        .then((data) => {
          data.categorias.forEach(item => {
            var option = document.createElement("option");
            option.text = item.nome;
            option.value = item.id;
            if (value == option.text) {
              option.selected = true;
            }
            document.getElementById("valor_categoria").appendChild(option)
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    else if (i == 3) {
      const input = document.querySelector('input[type="number"]');
      const valorSemCifrao = value.replace("R$&nbsp;", "").replace(".", "").replace(",", ".");
      cell.innerHTML = "<input type='number' step='0.01' min='0'  id='valor_real' value='" + valorSemCifrao + "'/>";
    }
    else if (i == 4) {
      var data = new Date(Date.parse(value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3")))
      var ano = data.getFullYear();
      var mes = ("0" + (data.getMonth() + 1)).slice(-2);
      var dia = ("0" + data.getDate()).slice(-2);
      var data_formatada = ano + "-" + mes + "-" + dia;
      cell.innerHTML = "<input type='date' id='valor_data' value='" + data_formatada + "'/>";
    }
    else if (i == 7) {
      cell.innerHTML = '<button id="salvar" class="form-section form button" type="submit"><b>&#128427;</b></button>';
    }
  });

  document.getElementById("salvar").addEventListener('click', function (event) {
    var inputs = row.getElementsByTagName("input");
    var select = row.getElementsByTagName("select")[0];
    var valores = [];

    for (var i = 0; i < inputs.length; i++) {
      valores.push(inputs[i].value);
    }
    valores.push(select.value);


    console.log(valores);
    var textocategoria = select.options[select.selectedIndex].text
    var valorFormatado = Number(valores[2]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    console.log(textocategoria);

    Array.from(cells).forEach((cell, i) => {
      value = cell.innerHTML;
      if (i == 0) {
        cell.innerHTML = valores[0];
      }
      else if (i == 1) {
        cell.innerHTML = valores[1];
      }
      else if (i == 2) {
        cell.innerHTML = textocategoria;
      }
      else if (i == 3) {
        cell.innerHTML = valorFormatado;
      }
      else if (i == 4) {
        cell.innerHTML = valores[3];
      }
      else if (i == 7) {
        cell.innerHTML = '';
      }
    });
    salva_despesa(valores);
  });
}

function salva_despesa(valores) {
  let id = valores[0];
  let descricao = valores[1];
  let valor = valores[2];
  let dataVencimento = valores[3];
  let categoria = valores[4];

  let url = dominio + '/despesa?id=' + id + '&descricao=' + descricao + '&categoria_id=' + categoria + '&valor=' + valor + '&data_vencimento=' + dataVencimento;
  console.log(url);
  fetch(url, {
    method: 'put'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });

}

function mostrarInput() {
  document.getElementById("form-categoria").style.display = "block"
}

function adicionarOption() {
  var categoria = document.getElementById("novaCategoria").value;
  var select = document.getElementById("categoria");
  var option = document.createElement("option");
  /* adiciona no banco e retorna novos valores*/
  const formData = new FormData();
  formData.append('nome', categoria);

  let url = dominio + '/categoria';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      if (response.status == 409) {
        document.getElementById("alerta").innerHTML = "Categoria já existe";
      } else {
        response.json().then((data) => {
          const NovaCategoria = {
            id: data.id,
            categoria_nome: data.nome,
          };
          option.text = data.nome,
            option.value = data.id,
            exibirCategorias(NovaCategoria);
          form.reset();
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  select.add(option);
  document.getElementById("form-categoria").style.display = "none";

}

getList();
getCategorias();
atualizarTotal();
form.addEventListener('submit', adicionarDespesa);





