//---------------------------------
// part 2 :  Query API
//---------------------------------

function query() {
  $('#loading').show();
  $('#more').hide();
  $('#menu').hide();
  document.getElementById('searchname').value = "";
  document.getElementById('rankorder').selectedIndex = 0;
  $('#rtb').empty();
  var words = document.getElementById("keywords").value.split(",");
  window.sessionStorage.keywords0 = document.getElementById("keywords").value;
  window.sessionStorage.displaynum = "20";
  window.sessionStorage.inp1 = document.getElementById("hindex1").checked;
  window.sessionStorage.inp2 = document.getElementById("hindex2").checked;
  window.sessionStorage.inp3 = document.getElementById("hindex3").checked;
  window.sessionStorage.inp4 = document.getElementById("hindex4").checked;
  document.getElementById('rankorder').selectedIndex = 0;
  wordlist = [];
  for (var i in words){
    if (words[i].length > 4){
      wordlist.push(words[i]); //alert(words[i]);
    }
  }
  wordlist = [];
  wordlist.push(words.join());
  getExpertList(wordlist);
  explist = [];
  expall = [];
}

function binScis(name) {
  name = name.replace(/[^a-zA-z]/g, '');
  var l = -1; var r = scis.length;
  while (l < r - 1) {
    var mid = Math.floor((l + r) / 2);
    if (scis[mid] <= name)
      l = mid;
    else
      r = mid;
  }
  if (l == -1) return false;
  return (scis[l] == name);
}

function checkScis(name) {
  if (binScis(name))
    return true;
  var a = name.split(" ");
  var b = a[a.length - 1];
  for (var i = 0; i < a.length - 1; i++)
    b = b + a[i];
  if (binScis(b))
    return true;
  return false;
}

function getExpertList(words) {
  lists = [];
  finished = 0;
  total = words.length;

  for (var i in words) {
    //alert(words[i]);
    lists.push([]);
    //var url = "https://api.aminer.org/api/search/people/multi?query="+words[i]+"&size=500";
    // var url = "https://api.aminer.org/api/reviewer/search?query="+words[i]+"&size=100";
    ele = document.getElementById('hindexform').elements;
    h1 = 200; h2 = 0;
    if (ele[0].checked) { if (0 < h1)  h1 = 0;  if (10 > h2) h2 = 10; }
    if (ele[1].checked) { if (10 < h1) h1 = 10; if (20 > h2) h2 = 20; }
    if (ele[2].checked) { if (20 < h1) h1 = 20; if (30 > h2) h2 = 30; }
    if (ele[3].checked) { if (30 < h1) h1 = 30; h2 = 200; }
    // if (h1 != 200 && h2 != 0)
      // url = url + "&hindex1=" + h1 + "&hindex2=" + h2;
    if (document.getElementById('location').selectedIndex != 0) {
      x = document.getElementById('location');
      location = x.options[x.selectedIndex].text;
      // url = url + "&nation=" + txt;
    }
    if (document.getElementById('language').selectedIndex != 0) {
      x = document.getElementById('language');
      language = x.options[x.selectedIndex].text;
      // url = url + "&language=" + txt;
    }
    //check if the user give a user ID
    var roster = document.getElementById("rosterInput").value.replace(/\s/g, '');
    if (!roster) roster = document.getElementById("roster").value;
    // url = url + "&roster=" + roster;

    // $.get(url, function(data, status){
    //   statechange(data);
    // });
    $.ajax({
      url: "https://innovaapi.aminer.cn/veneurecv/predictor/api/v1/valhalla/expert_rec/recommend/reviewers/",
      type: "POST",
      data: JSON.stringify({
        "resp_type": "json",
        "eb_src": "roster",
        "eb_ids": [roster],
        "query": words[i],
        "condition": {
          "h_index": [h1, h2]
        }
      }),
      success: function (data) {
        statechange(data);
      }
    })
    //testNewAlgorithm();
    function testNewAlgorithm(){
      var url = "http://166.111.7.105:9005/api/reviewer/query"
      var data = {"query":words[i], "size":500, "hindex1":h1, "hindex2":h2}
      data.authors = JSON.parse(window.sessionStorage.authors)
      $.ajax({
        type : "POST",
        url : url,
        data : $.toJSON(data),
        contentType : "application/json"
      });
    }
  }
}

function statechange(data) {
  var i = finished;
  finished = finished + 1;
  lists.push([]);
  var res = data.data.persons;
  for (var j in res) {
    if (res[j].org != '' && res[j].org != null) {
      res[j].affiliation = res[j].org;
    } else {
      res[j].affiliation = res[j].contact.affiliation;
    }
    res[j].email = res[j].contact.email;
    res[j].citation = res[j].n_citation;
    res[j].picture_url = res[j].avatar;
    res[j].homepage = res[j].contact.homepage;
    res[j].position = res[j].contact.position;
    var interests = '';
    for (var k in res[j].tags) {
      interests += res[j].tags[k].t + ", "
    }
    res[j].interests = interests.substr(0, interests.length - 2);
  }
  for (var j in res) {
    if (res[j].affiliation != '' && res[j].affiliation != null
      && res[j].email != '' && res[j].email != null) {
      lists[i].push(res[j]);
    }
  }
  for (var j in res) {
    if (!(res[j].affiliation != '' && res[j].affiliation != null
      && res[j].email != '' && res[j].email != null)) {
      lists[i].push(res[j]);
    }
  }
  if (finished == total) {
  //alert(total);
    explist = [];
    expall = [];
    var maxlen = 0;
    for (var i = 0; i < total; i++)
      if (lists[i].length > maxlen)
        maxlen = lists[i].length;
    for (var j = 0; j < maxlen; j++)
      for (var i = 0; i < total; i++) {
        if (lists[i][j] != null ) {
          var expcheck = true;
          for (var k in expall)
            if (expall[k].id == lists[i][j].id){
              expcheck = false; break;
            }
          if (!expcheck) continue;
            expall.push(lists[i][j]);
        }
      }
    for (var i in expall)
      expall[i].myid = i;
    searchName();
  }
}

function searchName() {
  str = document.getElementById("searchname").value;
  explist = [];
  for (var i in expall) {
    if (expall[i].name.match(RegExp(str, 'i')) != null)
      explist.push(expall[i]);
  }
  changeOrder();
}


function searchNameAminer() {
  $('#loading').show();
  $('#more').hide();
  $('#menu').hide();
  $('#rtb').empty();
  str = document.getElementById("searchname").value;
  document.getElementById('rankorder').selectedIndex = 2;
  explist = [];
  var url = "https://api.aminer.org/api/reviewer/search?query="+str+"&size=100";
  // var url = "https://api.aminer.org/api/search/person?query=" + str + "&size=100";
  function formatData(data) {
    var formated = {}
    results = []
    for (var i in data.result){
      var person = data.result[i];
      var newperson = {}
      newperson.name = person.name;
      newperson.workload = 0;
      newperson.email = "";
      newperson.affiliation = person.contact.affiliation;
      newperson.h_index = person.indices.h_index;
      newperson.citation = person.indices.num_citation;
      newperson.id = person.id;
      newperson.rating = 6;
      newperson.name_zh = person.name_zh;
      newperson.papers = person.indices.num_pubs;
      newperson.interests = person.tags.join(',');
      newperson.relevance = 0;
      newperson.homepage = person.contact.homepage;
      newperson.position = person.contact.position;
      newperson.picture_url = person.avatar;
      results.push(newperson);
      // results.push(person);
    }
    // console.log(JSON.stringify(newperson));
    formated.results = results;
    return formated;
  }
  $.get(url, function(data, status){
      // var formated = formatData(data);
      // console.log(JSON.stringify(formated));
      data = JSON.parse(data);
      console.log(JSON.stringify(data));

      for (var i in data.results){
        explist.push(data.results[i]);
      }
      changeOrder();
    });
}

function filter() {
  ans = [];
  function checkName(already, expert){
    // console.log(JSON.stringify(already));
    // console.log(JSON.stringify(expert));

    name1 = already.name.toLowerCase().replace(',', ' ').trim().split(' ');
    name2 = expert.name.toLowerCase().replace(',', ' ').trim().split(' ');
    // console.log(JSON.stringify(name1));
    // console.log(JSON.stringify(name2));
    if (name1.join('') == name2.join('') || name1.reverse().join('') == name2.join(''))
      return true;
    return false;
  }
  for (var i in explist){
    exp = explist[i];
    var flag = false;

    reviewers = [];
    if (sessionStorage.reviewers != null)
      reviewers = JSON.parse(sessionStorage.reviewers);
    for (var r in reviewers){
      reviewer = reviewers[r];
      if (checkName(reviewer, exp)){
        // console.log(JSON.stringify(reviewer.name));
        flag = true;
        break;
      }
    }
    if (flag)
      continue;
    authors = [];
    if (sessionStorage.authors != null)
      authors = JSON.parse(sessionStorage.authors);
    for (var r in authors){
      author = authors[r];
      if (checkName(author, exp)){
        // console.log(JSON.stringify(author.name));
        flag = true;
        break;
      }
    }
    if (flag)
      continue;
    ans.push(exp);
  }
  explist = ans;
}

function changeOrder() {
  od = document.getElementById('rankorder').selectedIndex;
  // if (od == 0)
  //   explist.sort(function(a,b) {
  //     if (Number(a.relevance) > Number(b.relevance)) return -1;
  //     if (Number(a.relevance) < Number(b.relevance)) return 1;
  //     return 0;
  //   });
  if (od == 1)
    explist.sort(function(a,b) {
      if (Number(a.h_index) < Number(b.h_index)) return -1;
      if (Number(a.h_index) > Number(b.h_index)) return 1;
      return 0;
    });
  if (od == 2)
    explist.sort(function(a,b) {
      if (Number(a.h_index) > Number(b.h_index)) return -1;
      if (Number(a.h_index) < Number(b.h_index)) return 1;
      return 0;
    });
  if (od == 3)
    explist.sort(function(a,b) {
      if (a.affiliation == null) return 1;
      if (b.affiliation == null) return -1;
      if (a.affiliation < b.affiliation) return -1;
      if (a.affiliation > b.affiliation) return 1;
      return 0;
    });

  email = []
  noemail = []
  for (var i in explist){
    exp = explist[i];
    if (exp.email == '')
      noemail.push(exp);
    else
      email.push(exp);
  }
  explist = email.concat(noemail)
  filter();
  // console.log(JSON.stringify(explist));
  // console.log(JSON.stringify(noemail));
  // console.log(JSON.stringify(email));
  $('#rtb').empty();
  createRes();
}

function createRes() {
  window.sessionStorage.explist = JSON.stringify(explist);
  var maxworkload = 10;
  for (var i in explist) {
    if (explist[i].workload != undefined && explist[i].workload > maxworkload)
      maxworkload = explist[i].workload;
  }

  for (var i in explist) {
    exptb = document.createElement('table');
    exptb.id = "exptb" + String(i);
    exptb.border = 0; exptb.cellPadding = 0;

    row = document.createElement('tr');

    col = document.createElement('td');
    col.style.width = "42px"; col.style.maxWidth = "42px";
    a = document.createElement("a");
    if (explist[i].homepage == "" || explist[i].homepage == null)
      a.href = "javascript:void(0);";
    else {
      a.href = explist[i].homepage;
      a.target = "_blank";
    }
    a.style.width = "inherit"; a.style.height = "inherit";
    img = document.createElement('img');
    img.src = explist[i].picture_url;
    if (explist[i].picture_url == "" || explist[i].picture_url == null)
      img.src = chrome.extension.getURL("resource/default.jpg");
    img.style.width = "inherit"; img.style.height = "inherit";
    a.appendChild(img);
    col.appendChild(a); col.style.verticalAlign = "top";
    slt = document.createElement('input'); slt.id = "select"+String(i);
    slt.type = "image"; slt.value = i; slt.style.width = "43px";
    slt.src = chrome.extension.getURL("resource/select.png");
    slt.onclick = function() {
      for (var j in explist){
        document.getElementById("select"+String(j)).src = chrome.extension.getURL("resource/select.png");
      }
      document.getElementById("select"+String(this.value)).src = chrome.extension.getURL("resource/selected.png");
      fillin(this.value);
      url = "https://api.aminer.org/api/reviewer/workload?id=" + explist[this.value].id;
      $.get(url);
    }
    col.appendChild(slt);
    col.style.verticalAlign = "top"; col.style.paddingBottom = "10px";
    row.appendChild(col);

    col = document.createElement('td');
    col.style.width = "100%"; col.style.maxWidth = "100%";
    a = document.createElement("a");
    a.href = "https://aminer.cn/profile/"+explist[i].id;
    a.target = "_blank";
    txt = document.createElement('span');
    txt.style.fontSize = "14px"; txt.style.fontWeight = "bold"; txt.style.color = "black";
    txt.appendChild(document.createTextNode(explist[i].name));
    a.appendChild(txt);
    col.appendChild(a);
    if (checkScis(explist[i].name)) {
      img = document.createElement("img");
      img.src = chrome.extension.getURL("resource/logo.jpg");
      img.style.width = "15px"; img.style.height = "15px";
      img.style.marginLeft = "3px";
      col.appendChild(img);
    }
    col.appendChild(document.createElement('br'));

    txt = document.createElement('span');
    txt.style.fontFamily = "times"; txt.style.color = "grey";
    if (explist[i].position != null && explist[i].position.length > 100) { explist[i].position = null; }
    txt.appendChild(document.createTextNode(' (' + explist[i].position + ', ' + explist[i].affiliation + ')'));
    if (explist[i].position != null && explist[i].position != ""
      && explist[i].affiliation != null && explist[i].affiliation != "") {
      col.appendChild(txt); col.appendChild(document.createElement('br'));
    }

    function addNameValue(name, value, breakline) {
      txt = document.createElement('span');
      txt.style.fontFamily = "arial"; txt.style.fontWeight = "700";
      txt.appendChild(document.createTextNode(name + ": "));
      col.appendChild(txt);
      txt = document.createElement('span'); txt.style.fontFamily = "arial";
      txt.appendChild(value);
      col.appendChild(txt);
      if (breakline) col.appendChild(document.createElement('br'));
    }

    addNameValue("H-index", document.createTextNode(explist[i].h_index), true);
    str = '';
    if (explist[i].interests != null) str += explist[i].interests.replace(/,/g, ", ");
    addNameValue("Expertise", document.createTextNode(str), true);
    a = document.createElement("a");
    a.href = "mailto:" + explist[i].email;
    a.style.wordBreak = "break-all";
    if (explist[i].email == null) explist[i].email = "unknown";
    a.appendChild(document.createTextNode(explist[i].email));
    addNameValue("E-mail", a, true);

    col.style.verticalAlign = "top";

    row.appendChild(col);
    col.style.paddingBottom = "4px";
    exptb.appendChild(row);

    row = document.createElement('tr');
    col = document.createElement('td');
    col.appendChild(document.createTextNode("Workload:"));
    col.style.fontFamily = "'Lucida Sans Unicode', 'Lucida Grande', sans-serif";
    //col.style.fontStyle = "italic";
    col.style.fontWeight = 600;
    row.appendChild(col);
    col = document.createElement('td');
    workload = document.createElement("progress");
    workload.style.width = "95%";
    var wl = explist[i].workload;
    if (wl == undefined) wl = 0;
    if (wl > 100) wl = 100;
    workload.max = maxworkload; workload.value = wl;
    col.appendChild(workload);
    row.appendChild(col);
    exptb.appendChild(row);

    row = document.createElement('tr');
    col = document.createElement('td');
    col.appendChild(document.createTextNode("Rating:"));
    col.style.fontFamily = "'Lucida Sans Unicode', 'Lucida Grande', sans-serif";
    //col.style.fontStyle = "italic";
    col.style.fontWeight = 600;
    row.appendChild(col);
    col = document.createElement('td');
    var rt = explist[i].rating;
    if (rt == undefined) rt = 6;
    for (var j = 1; j <= 5; j++) {
      img = document.createElement("img");
      if (j * 2 <= rt)
        img.src = chrome.extension.getURL("resource/star_on.png");
      else
        img.src = chrome.extension.getURL("resource/star_off.png");
      img.style.width = "15px";
      col.appendChild(img);
    }
    tbdown = document.createElement("input");
    tbdown.type = "image";
    tbdown.src = chrome.extension.getURL("resource/thumb_down.png");
    tbdown.style.height = "15px"; tbdown.align = "right"; tbdown.style.marginRight = "10px";
    tbdown.value = explist[i].id;
    col.appendChild(tbdown);
    tbup = document.createElement("input");
    tbup.type = "image";
    tbup.src = chrome.extension.getURL("resource/thumb_up.png");
    tbup.style.height = "15px"; tbup.align = "right"; tbup.style.marginRight = "10px";
    tbup.value = explist[i].id;
    col.appendChild(tbup);
    tbdown.onclick = function(){
      //this.disabled = true;
      url = "https://api.aminer.org/api/reviewer/rating?id=" + this.value + "&delta=-1";
      $.get(url);
    }
    tbup.onclick = function(){
      //this.disabled = true;
      url = "https://api.aminer.org/api/reviewer/rating?id=" + this.value + "&delta=1";
      $.get(url);
    }
    row.appendChild(col);
    exptb.appendChild(row);

    row = document.createElement("tr");
    col = document.createElement("td");
    col.colSpan = 2;
    col.appendChild(exptb);
    row.appendChild(col);
    col.style.paddingBottom = "14px";
    row.id = "exprow" + String(i);
    $(row).hide();

    document.getElementById('rtb').appendChild(row);

  }
  $('#loading').hide();
  $('#more').show();
  $('#menu').show();
  if (window.sessionStorage.displaynum == undefined){
    window.sessionStorage.displaynum = "20";
  }
  displaynum = Number(window.sessionStorage.displaynum);
  displayRes();
}

function displayRes() {
  for (var i in explist) {
    if (i >= displaynum) break;
    $("#exprow"+String(i)).show();
  }
  if (displaynum > explist.length)
    displaynum = explist.length;
  span = document.getElementById('resnum');
  span.innerHTML = " ("+String(displaynum)+" of "+String(explist.length)+" experts)";
}

function showMore() {
  //alert("more");
  displaynum = displaynum + 20;
  displayRes();
  window.sessionStorage.displaynum = String(displaynum);
}

//3.0.5
function getFirstEmail(src) //if multiple emails in src (divided by ',') then return the first email address
{
  var commaIndex = src.indexOf(",");
  if (commaIndex == -1) {
    return src;
  } else {
    var ret = src.substr(0, commaIndex);
    alert("Mutiple email addresses. Select the first one (" + ret + ").")
    return ret;
  }
}

//copyright: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
//3.0.5

function fillin(i) {
  //alert(i);
  var fstname = explist[i].name.split(' ')[0];
  document.getElementsByName("PERSON_FIRSTNAME")[0].value = fstname;
  var lstname = explist[i].name.split(' ').pop();
  document.getElementsByName("PERSON_LASTNAME")[0].value = lstname;
  var eadd = explist[i].email;
  if (eadd == null)
    eadd = "";
  //3.05
  eadd = getFirstEmail(eadd);
  if (validateEmail(eadd)) {

  } else {
    eadd = ""
    alert("Email address not valid!")
  }
  //3.05
  document.getElementsByName("EMAIL_ADDRESS")[0].value = eadd;
}


