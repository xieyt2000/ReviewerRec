url = window.location.href;
ismanuscript = false;
if (url.match("http://jpmed.qdu.edu.cn/Journalx_jzyx/manuscript") != null)
  ismanuscript = true;

isreviewing = false;
if (url.match("Manuscript!view") != null)
  isreviewing = true;

txt = $.ajax({
  url: chrome.extension.getURL("resource/scis.txt"),
  async: false
}).responseText;
scis = txt.split('\r\n');

if (document.getElementById("side") == null) {
  if (ismanuscript && !isreviewing && window.sessionStorage.title != null) {
    window.sessionStorage.show = undefined;
  }
  createUI((window.sessionStorage.show == "true"));
}
if (window.sessionStorage.show == "true") {
  $("#side").show();
}

if (ismanuscript) {
  if (!isreviewing) {
    chrome.runtime.sendMessage("not");
    window.sessionStorage.clear();
  } else {
    chrome.runtime.sendMessage("ok");
    if (window.sessionStorage.keywords0 == null && window.sessionStorage.keywords != null) {
      window.sessionStorage.keywords0 = window.sessionStorage.keywords;
    }
    show = window.sessionStorage.show;
    window.sessionStorage.clear();
    window.sessionStorage.show = show;
    analyze();
    //}
    if (window.sessionStorage.explist != null) {
      explist = JSON.parse(window.sessionStorage.explist);
      createRes();
      if (window.sessionStorage.scroll != null) {
        document.getElementById('result').scrollTop = Number(window.sessionStorage.scroll);
      }
    }
  }
}


//---------------------------------
// part 1 :   createUI
//---------------------------------

function createUI(show) {

  side = document.createElement('div');
  side.id = "side";
  if (!show) {
    $(side).hide();
  }

  window.addEventListener("scroll", setSide);
  window.addEventListener("resize", setSide);

  function setSide() {
    side.style.position = "absolute";
    //side.style.float = "right";
    toppos = window.pageYOffset + 10;
    if (toppos < 200 && ismanuscript) {
      toppos = 200;
    }
    side.style.top = String(toppos) + "px";
    side.style.right = "10px";
    side.style.width = "270px";
    div = document.getElementById("result");
    if (div != null) {
      div.style.height = String(document.documentElement.clientHeight - 290) + "px";
    }

    function getElementLeft(element) {
      var actualLeft = element.offsetLeft;
      var current = element.offsetParent;
      while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
      }
      return actualLeft;
    }
  }

  setSide();
  side.style.fontFamily = "Verdana";
  side.style.fontSize = "13px";


  table = document.createElement('table');
  table.cellPadding = "2";
  table.cellSpacing = "0";
  table.border = "1";
  table.style.width = "97%";
  table.style.borderCollapse = "collapse";
  table.style.backgroundColor = "#F8F8F8";
  row = document.createElement('tr');
  col = document.createElement('th');
  col.colSpan = "2";
  col.align = "left";
  col.style.background = "#FAE6BE";
  txt = document.createTextNode(" 审稿人推荐系统");
  col.appendChild(txt);
  row.appendChild(col);
  img = document.createElement("img");
  img.src = chrome.runtime.getURL("resource/close.png");
  img.style.height = "16px";
  img.align = "right";
  img.onclick = function () {
    $("#side").hide();
    window.sessionStorage.show = "false";
  }
  col.appendChild(img);
  row.appendChild(col);
  table.appendChild(row);

  qtb = document.createElement('table');
  qtb.cellSpacing = "1";

  row = document.createElement('tr');
  $(row).hide();
  col = document.createElement('td');
  col.appendChild(document.createTextNode("文题"));
  row.appendChild(col);
  col = document.createElement('td');
  inp = document.createElement('input');
  inp.id = 'title';
  inp.type = 'text';
  inp.style.width = "170px";
  ///inp.value = info[1];
  col.appendChild(inp);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  $(row).hide();
  col = document.createElement('td');
  col.appendChild(document.createTextNode("作者"));
  row.appendChild(col);
  col = document.createElement('td');
  inp = document.createElement('input');
  inp.id = 'authors';
  inp.type = 'text';
  inp.style.width = "170px";
  //inp.value = info[2];
  col.appendChild(inp);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  $(row).hide();
  col = document.createElement('td');
  col.appendChild(document.createTextNode("摘要"));
  row.appendChild(col);
  col = document.createElement('td');
  inp = document.createElement('textarea');
  inp.id = 'abstract';
  inp.type = 'text';
  inp.style.width = "168px";
  inp.style.resize = "none";
  //inp.value = info[4];
  col.appendChild(inp);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td');
  col.colSpan = "2";
  col.appendChild(document.createTextNode("关键词 (用 \", \" 分隔):"));
  img = document.createElement("input");
  img.value = 0;
  img.type = "image";
  img.src = chrome.extension.getURL("resource/refresh.png");
  img.style.height = "16px";
  img.align = "right";
  $(img).hide();
  img.onclick = function () {
    if (this.value == 1) {
      document.getElementById('keywords').value = sessionStorage.keywords;
      this.value = 0;
    } else {
      document.getElementById('keywords').value = sessionStorage.extractedKeywords;
      this.value = 1;
    }
  }

  col.appendChild(img);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td');
  col.colSpan = "2";
  inp = document.createElement('textarea');
  if (isreviewing) {
    inp.value = "提取中...";
  }
  inp.id = 'keywords';
  inp.type = 'text';
  inp.style.fontFamily = "Verdana";
  inp.style.fontSize = "11px";
  inp.onkeydown = function () {
    if (event.keyCode == 13) query();
  };
  inp.style.width = "250px";
  inp.style.height = "60px";
  inp.style.resize = "none";
  col.appendChild(inp);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  row.style.height = "24px";
  col = document.createElement('td');
  col.colSpan = "2";
  col.appendChild(document.createTextNode("h指数:  "));
  form = document.createElement('form');
  form.style.display = 'inline';
  form.id = 'hindexform';
  inp1 = document.createElement('input');
  inp1.type = 'checkbox';
  inp1.id = 'hindex1';
  inp1.style.margin = 0;
  form.appendChild(inp1);
  form.appendChild(document.createTextNode('<10 '));
  inp2 = document.createElement('input');
  inp2.type = 'checkbox';
  inp2.id = 'hindex2';
  inp2.style.margin = 0;
  form.appendChild(inp2);
  form.appendChild(document.createTextNode('10~20 '));
  inp3 = document.createElement('input');
  inp3.type = 'checkbox';
  inp3.id = 'hindex3';
  inp3.style.margin = 0;
  form.appendChild(inp3);
  form.appendChild(document.createTextNode('20~30 '));
  inp4 = document.createElement('input');
  inp4.type = 'checkbox';
  inp4.id = 'hindex4';
  inp4.style.margin = 0;
  form.appendChild(inp4);
  form.appendChild(document.createTextNode('>30'));
  inp1.checked = true;
  inp2.checked = true;
  if (window.sessionStorage.inp1 != undefined) inp1.checked = (window.sessionStorage.inp1 == "true");
  if (window.sessionStorage.inp2 != undefined) inp2.checked = (window.sessionStorage.inp2 == "true");
  if (window.sessionStorage.inp3 != undefined) inp3.checked = (window.sessionStorage.inp3 == "true");
  if (window.sessionStorage.inp4 != undefined) inp4.checked = (window.sessionStorage.inp4 == "true");
  inp1.onclick = function () {
    if (inp1.checked) {
      if (inp4.checked) inp3.checked = true;
      if (inp3.checked) inp2.checked = true;
    }
  }
  inp2.onclick = function () {
    if (inp2.checked) {
      if (inp4.checked) inp3.checked = true;
    } else {
      if (inp3.checked) inp1.checked = false;
    }
  }
  inp3.onclick = function () {
    if (inp3.checked) {
      if (inp1.checked) inp2.checked = true;
    } else {
      if (inp2.checked) inp4.checked = false;
    }
  }
  inp4.onclick = function () {
    if (inp4.checked) {
      if (inp1.checked) inp2.checked = true;
      if (inp2.checked) inp3.checked = true;
    }
  };
  col.appendChild(form);
  //inp = document.createElement('input'); inp.id = 'hindex1'; inp.type = 'text'; inp.style.width = '25px';
  //col.appendChild(inp);
  //col.appendChild(document.createTextNode(" ~ "));
  //inp = document.createElement('input'); inp.id = 'hindex2'; inp.type = 'text'; inp.style.width = '25px';
  //col.appendChild(inp);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  row.style.height = "24px";
  col = document.createElement('td');
  col.colSpan = "2";
  col.appendChild(document.createTextNode("地区:  "));
  sel = document.createElement('select');
  sel.id = 'location';
  sel.style.width = "80px";
  opt = document.createElement("option");
  opt.text = "所有";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "中国大陆";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "美国";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "台湾地区";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "日本";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "加拿大";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "英国";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "德国";
  sel.add(opt, null);
  col.appendChild(sel);
  col.appendChild(document.createTextNode("   语言:  "));
  sel = document.createElement('select');
  sel.id = 'language';
  sel.style.width = "55px";
  opt = document.createElement("option");
  opt.text = "中文";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "所有";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "英文";
  sel.add(opt, null);
  col.appendChild(sel);
  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td');
  col.colSpan = "2";
  col.align = "center";
  p = document.createElement('span');
  $(p).text("Search by:");
  //col.appendChild(p);
  //col.align = "left";
  //col.appendChild(document.createElement('br'));
  sub = document.createElement("input");
  sub.type = "image";
  sub.src = chrome.extension.getURL("resource/search.png");
  sub.style.width = "150px";
  sub.style.marginTop = "4px";
  sub.style.marginBottom = "4px"; //sub.style.marginRight = "4px";
  sub.align = "center";
  sub.onclick = function () {
    query();
  };
  col.appendChild(sub);

  sel = document.createElement('select');
  sel.style.marginLeft = "10px";
  sel.style.width = "80px";
  $(sel).hide();
  sel.id = "roster";
  opt = document.createElement('option');
  opt.text = 'Default';
  opt.value = "";
  sel.add(opt, null);
  col.appendChild(sel);

  //todo
  url = "https://raw.githubusercontent.com/thomas0809/ReviewerConfigure/master/journal.json";
  $.get(url, function (data, status) {
    var conf = JSON.parse(data);
    var journal = window.location.href.replace(/.*\.manuscriptcentral\.com\//, '').replace(/[\/\?].*/, '');
    //alert(journal);
    if (!(journal in conf)) {
      journal = "default";
    }
    sel = document.getElementById("roster");
    sel.remove(0);
    for (var i in conf[journal]['list']) {
      var x = conf[journal]['list'][i];
      var opt = document.createElement('option');
      opt.text = x['name'];
      opt.value = x['id'];
      sel.add(opt, null);
    }
    sel.selectedIndex = conf[journal]['default'];
    if (conf[journal]['option']) {
      $(sel).show();
    }
  });

  row.appendChild(col);
  qtb.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td');
  col.appendChild(qtb);
  row.appendChild(col);
  table.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('th');
  col.colSpan = "2";
  col.align = "left";
  col.style.background = "#FAE6BE";
  txt = document.createTextNode(" 结果 ");
  col.appendChild(txt);
  span = document.createElement('span');
  span.id = "resnum";
  span.style.fontWeight = "normal";
  col.appendChild(span);
  row.appendChild(col);
  table.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td');
  col.id = "menu";
  $(col).hide();
  inp = document.createElement('input');
  inp.type = "text";
  inp.style.width = "130px";
  inp.id = "searchname";
  inp.style.marginLeft = "1px";
  inp.style.verticalAlign = "middle";
  inp.onkeydown = function () {
    if (event.keyCode == 13) searchNameAminer();
  };
  col.appendChild(inp);
  inp = document.createElement("input");
  inp.type = "image";
  inp.src = chrome.extension.getURL("resource/search.gif");
  inp.style.verticalAlign = "middle";
  // inp.onclick = searchName;
  inp.onclick = function () {
    searchNameAminer();
  };
  col.appendChild(inp);
  sel = document.createElement("select");
  sel.id = "rankorder";
  sel.onchange = function () {
    changeOrder();
  };
  sel.style.marginLeft = "10px";
  sel.style.width = "85px";
  sel.style.verticalAlign = "middle";
  opt = document.createElement("option");
  opt.text = "相关度";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "h指数↑";
  sel.add(opt, null);
  opt = document.createElement("option");
  opt.text = "h指数↓";
  sel.add(opt, null);
  //opt = document.createElement("option"); opt.text = "Nationality"; sel.add(opt, null);
  //opt = document.createElement("option"); opt.text = "Affiliation"; sel.add(opt, null);
  col.appendChild(sel);
  row.appendChild(col);
  row.style.borderBottomStyle = "hidden";
  table.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td');
  div = document.createElement('div');
  div.id = "result";
  div.style.height = String(document.documentElement.offsetHeight - 300) + "px";
  div.style.overflow = "auto";
  div.style.overflowX = "hidden";
  img = document.createElement("img");
  img.id = "loading";
  img.align = "center";
  img.src = chrome.extension.getURL("resource/loading.gif");
  img.style.filter = "chroma(color=#ffffff)";
  img.style.display = "none";
  img.style.maxWidth = "10%";
  img.style.border = "0";
  div.appendChild(img);
  rtb = document.createElement("table");
  rtb.id = "rtb";
  rtb.style.width = "97%";
  rtb.style.maxWidth = "97%";
  rtb.style.wordWrap = "break-word";
  div.appendChild(rtb);
  par = document.createElement('div');
  par.align = "center";
  more = document.createElement('a');
  more.id = "more";
  img = document.createElement("img");
  img.src = chrome.extension.getURL("resource/viewmore.png");
  more.appendChild(img);
  more.onclick = function () {
    showMore();
  };
  more.style.display = "none";
  more.style.cursor = "pointer";
  par.appendChild(more);
  div.appendChild(par);
  div.onscroll = function () {
    window.sessionStorage.scroll = div.scrollTop;
  }
  col.appendChild(div);
  row.appendChild(col);
  table.appendChild(row);

  row = document.createElement('tr');
  col = document.createElement('td')
  col.align = "right";
  col.appendChild(document.createTextNode('Powered by '));
  aminer = document.createElement('a');
  aminer.href = "http://arnetminer.org/";
  aminer.target = "_blank";
  aminer.appendChild(document.createTextNode('AMiner'));
  col.appendChild(aminer);
  row.appendChild(col);
  table.appendChild(row);
  side.appendChild(table);

  document.body.appendChild(side);
  setSide();

}