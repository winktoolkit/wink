// Tipue JS 4.2
//
// Tipue JS Copyright (C) 2002-2007 Tri-State Consultants
// Tipue JS is open source and released under the GNU General Public License


tid = window.location.search;
rd = tid.indexOf('?d=');
rn = tid.indexOf('&n=');
if (rn == -1)
{
	dit = tid.substring(rd + 3);
	tn = 0;
}
else
{
	dit = tid.substring(rd + 3, rn);
	tn = parseInt(tid.substring(rn + 3));
}
dit = dit.replace(/\+/g, ' ');
dit = decodeURIComponent(dit);

dit = dit.replace(/\s+/g, ' ');
od = dit;
hd = dit;

dit = dit.replace(/ and /gi, ' ');
dit = dit.replace(/- /gi, '-');
dit = dit.replace(/\s+/g, ' ');	

nr = per_page;
r_l = results_location;
b_q = bold_query;
b_t = bold_title;
b_f = bold_footer;
ct = context;
c_s = context_seed;
seed = rank_seed;
ct_l = descriptive_length;
c_w = common_words;

tr = new Array();
co = 0;
nd = 0;
nc = 0;
sp_l = '';
cw_l = '';

if (data_source < 2)
{
	s = new Array();			
	if (window.ActiveXObject)
	{
		xmldoc = new ActiveXObject("Microsoft.XMLDOM");
		xmldoc.async = false;
		xmldoc.onreadystatechange = function()
		{
			if (xmldoc.readyState == 4) get_xml();
		}
		xmldoc.load(data);
	}
	else if (window.XMLHttpRequest)
	{
		client = new XMLHttpRequest();
		client.open("GET", data, false);
		client.send(null);
		xmldoc = client.responseXML;	
		get_xml();		
	}
}

function get_xml()
{	
	if (document.implementation && document.implementation.createDocument) xmldoc.normalize();
	if (data_source == 0)
	{
		pages = xmldoc.getElementsByTagName("item");
		for (c = 0; c < pages.length; c++)
		{
			rs = pages[c];
			es_0 = rs.getElementsByTagName("title")[0].firstChild.data;
			es_0 = es_0.replace(/\^|\~/g, '');
			es_1 = rs.getElementsByTagName("link")[0].firstChild.data;
			es_1 = es_1.replace(/\^|\~/g, '');
			es_2 = rs.getElementsByTagName("description")[0].firstChild.data;
			es_2 = es_2.replace(/\^|\~/g, '');
			s[c] = es_0 + '^' + es_1 + '^' + es_2 + '^0^0';
		}
	}
	if (data_source == 1)
	{
		pages = xmldoc.getElementsByTagName(xml_pages);
		for (c = 0; c < pages.length; c++)
		{
			rs = pages[c];
			es_0 = rs.getElementsByTagName(xml_title)[0].firstChild.data;
			es_0 = es_0.replace(/\^|\~/g, '');
			es_1 = rs.getElementsByTagName(xml_url)[0].firstChild.data;
			es_1 = es_1.replace(/\^|\~/g, '');
			es_2 = rs.getElementsByTagName(xml_content)[0].firstChild.data;
			es_2 = es_2.replace(/\^|\~/g, '');
			if (rs.getElementsByTagName("open").length > 0) es_3 = rs.getElementsByTagName("open")[0].firstChild.data; else es_3 = '0';
			if (rs.getElementsByTagName("rank").length > 0) es_4 = rs.getElementsByTagName("rank")[0].firstChild.data; else es_4 = '0';
			s[c] = es_0 + '^' + es_1 + '^' + es_2 + '^' + es_3 + '^' + es_4;
		}
	}
}

dit = dit.replace(/\^/g, '');
dit = dit.replace(/^\s+/, '');
dit = dit.replace(/\s+$/, '');
if (seed < 1) seed = 1;
if (seed > 9) seed = 10;

v_d = false;
if (dit == '' || dit == ' ') v_d = true;

t_m = 0;
if (dit.charAt(0) == '"' && dit.charAt(dit.length - 1) == '"') t_m = 1;

if (t_m == 0 && !v_d)
{
	if (c_w.length > 0)
	{
		cw = c_w.split(' ');
		for (i = 0; i < cw.length; i++)
		{
			pat = new RegExp("\\b" + cw[i] + "\\b", 'gi');
			rn = dit.search(pat);
			if (rn != -1)
			{
				pat_1 = new RegExp("\\+" + cw[i] + "\\b", 'gi');
				pat_2 = new RegExp("\\-" + cw[i] + "\\b", 'gi');
				rn_1 = dit.search(pat_1);
				rn_2 = dit.search(pat_2);
				if (rn_1 == -1 && rn_2 == -1)
				{
					cw_l += '<b>' + cw[i] + '</b>, ';
					dit = dit.replace(pat, '');
				}
			}
		}
		if (cw_l.length > 0)
		{
			cw_l = cw_l.replace(/\s+$/, '');
			if (cw_l.charAt(cw_l.length - 1) == ',') cw_l = cw_l.substr(0, cw_l.length - 1);
			dit = dit.replace(/\s+/g, ' ');
			dit = dit.replace(/^\s+/, '');
			dit = dit.replace(/\s+$/, '');
			if (dit == '' || dit == ' ') v_d = true;
			hd = dit;
		}
	}

	if (spell.length > 0)
	{
		cw = spell.split(' ');
		for (i = 0; i < cw.length; i++)
		{
			wt = cw[i].split('^');
			pat = new RegExp("\\b" + wt[0] + "\\b", 'i');
			rn = dit.search(pat);
			if (rn != -1)
			{
				if (sp_l.length < 1) sp_l = dit;
				pat = new RegExp(wt[0], 'i');
				sp_l = sp_l.replace(pat, wt[1]);
			}
		}
	}

	if (stemming.length > 0)
	{
		cw = stemming.split(' ');
		for (i = 0; i < cw.length; i++)
		{
			wt = cw[i].split('^');
			pat = new RegExp("\\b" + wt[0] + "\\b", 'i');
			rn = dit.search(pat);
			if (rn != -1)
			{	
				dit = dit.replace(pat, wt[0] + '~' + wt[1]);
			}
		}
	}

	dit = dit.replace(/ or /gi, '~');
	dit = dit.replace(/\"/gi, '');
	ct_d = 0;
	w_in = new Array();
	wt = dit.split(' ');
	for (i = 0; i < wt.length; i++)
	{
		w_in[i] = 0;
		if (wt[i].charAt(0) == '-') w_in[i] = 1;
		pat = new RegExp("\\~", 'i');
		rn = wt[i].search(pat);
		if (rn != -1) w_in[i] = 2;
		wt[i] = wt[i].replace(/^\-|^\+/gi, '');
	}

	a = 0;
	for (c = 0; c < s.length; c++)
	{
		es = s[c].split('^');
		rk = 1000;
		if (es[3] == null) es[3] = '0';
		if (es[4] == null) es[4] = '0';
		if (parseInt(es[4]) > 10) es[4] = '10';
		pa = 0;
		nh = 0;
		for (i = 0; i < w_in.length; i++)
		{
			if (w_in[i] == 0)
			{
				nh++;
				nt = 0;
				pat = new RegExp("\\b" + wt[i] + "\\b", 'i');
				rn = es[0].search(pat);
				if (rn != -1)
				{
					rk -= seed * 3;
					rk -= parseInt(es[4]);					
					nt = 1;
					if (ct == 1) ct_d = 1;
				}
				rn = es[2].search(pat);
				if (rn != -1)
				{
					rk -= seed;
					rk -= parseInt(es[4]);					
					nt = 1;
				}
				if (nt == 1) pa++;
			}
			if (w_in[i] == 1)
			{
				pat = new RegExp("\\b" + wt[i] + "\\b", 'i');
				rn = es[0].search(pat);
				if (rn != -1) pa = 0;
				rn = es[2].search(pat);
				if (rn != -1) pa = 0;
			}
			if (w_in[i] == 2)
			{
				nh++;
				nt = 0;
				w_o = wt[i].split('~');
				pat = new RegExp("\\b" + w_o[0] + "\\b", 'i');
				pat_2 = new RegExp("\\b" + w_o[1] + "\\b", 'i');
				rn = es[0].search(pat);
				rn_2 = es[0].search(pat_2);
				if (rn != -1 || rn_2 != -1)
				{
					rk -= seed / 2;
					rk -= parseInt(es[4]);					
					nt = 1;
					if (ct == 1) ct_d = 1;
				}
				rn = es[2].search(pat);
				rn_2 = es[2].search(pat_2);
				if (rn != -1 || rn_2 != -1)
				{
					rk -= seed / 2;
					rk -= parseInt(es[4]);					
					nt = 1;
				}
				if (nt == 1) pa++;
			}
		}
		
		if (pa == nh && nh != 0)
		{
			es_c = '';
			ci_e = es[2].split(' ');
			if (ci_e.length < ct_l)
			{
				es_c = es[2];
			}
			else
			{
				for (i = 0; i < ct_l; i++)
				{
					es_c += ci_e[i] + ' '; 	
				}
			}
			es_c = es_c.replace(/^\s*|\s*$/g, '');
			if (es_c.charAt(es_c.length - 1) == '.' || es_c.charAt(es_c.length - 1) == ',') es_c = es_c.substr(0, es_c.length - 1);
			es_c += ' ...';	
			
			if (ct == 1 && ct_d == 0)
			{	
				ct_f = true;
				pat = new RegExp("\\b" + wt[0] + "\\b", 'i');
				rn = es[2].search(pat);
				if (rn > c_s)
				{
					t_1 = es[2].substr(rn - (c_s - 1));
					rn = t_1.indexOf('. ');
					if (rn != -1 && rn < (c_s / 2))
					{
						t_1 = t_1.substr(rn + 1);
						t_2 = t_1.split(' ');
						if (t_2.length > ct_l)
						{
							es_c = '';
							for (i = 1; i < ct_l + 1; i++)
							{
								es_c += ' ' + t_2[i];
							}
							if (es_c.charAt(es_c.length - 1) == '.' || es_c.charAt(es_c.length - 1) == ',') es_c = es_c.substr(0, es_c.length - 1);
							es_c += ' ...';
							ct_f = false;
						}
					}
				}
				if (ct_f)
				{
					rn = es[2].search(pat);
					t_1 = es[2].substr(rn - (c_s / 5));
					rn = t_1.indexOf(' ');
					if (rn != -1)
					{
						t_1 = t_1.substr(rn + 1);
						t_2 = t_1.split(' ');
						es_c = '';
						if (t_2.length > ct_l)
						{
							for (i = 1; i < ct_l + 1; i++)
							{
								es_c += ' ' + t_2[i];
							}
						}
						else
						{
							for (i = 1; i < t_2.length; i++)
							{
								es_c += ' ' + t_2[i];
							}						
						}
						if (es_c.charAt(es_c.length - 1) == '.' || es_c.charAt(es_c.length - 1) == ',') es_c = es_c.substr(0, es_c.length - 1);
						es_c += ' ...';
					}
				}
			}
			
			tr[a] = rk + '^' + es[0] + '^' + es[1] + '^' + es_c + '^' + es[2] + '^' + es[3] + '^' + es[4];
			a++;
		}
	}
	tr.sort();
	co = a;
}

if (t_m == 1 && !v_d)
{
	dit = dit.replace(/"/gi, '');
	a = 0;
	ct_d = 0;
	pat = new RegExp(dit, 'i');
	for (c = 0; c < s.length; c++)
	{
		es = s[c].split('^');
		rk = 1000;
		if (es[3] == null) es[3] = '0';
		if (es[4] == null) es[4] = '0';
		if (parseInt(es[4]) > 10) es[4] = '10';
		rn = es[0].search(pat);
		if (rn != -1)
		{
			rk -= seed * 3;
			rk -= parseInt(es[4]);
			ct_d = 1;
		}
		rn = es[2].search(pat);
		if (rn != -1)
		{
			rk -= seed;
			rk -= parseInt(es[4]);
		}
		if (rk < 1000)
		{
			es_c = '';
			ci_e = es[2].split(' ');
			if (ci_e.length < ct_l)
			{
				es_c = es[2];
			}
			else
			{
				for (i = 0; i < ct_l; i++)
				{
					es_c += ci_e[i] + ' '; 	
				}
			}
			es_c = es_c.replace(/^\s*|\s*$/g, '');
			if (es_c.charAt(es_c.length - 1) == '.' || es_c.charAt(es_c.length - 1) == ',') es_c = es_c.substr(0, es_c.length - 1);
			es_c += ' ...';	
			
			if (ct == 1 && ct_d == 0)
			{
				ct_f = true;
				rn = es[2].search(pat);
				if (rn > c_s)
				{
					t_1 = es[2].substr(rn - (c_s - 1));
					rn = t_1.indexOf('. ');
					if (rn != -1 && rn < (c_s / 2))
					{
						t_1 = t_1.substr(rn + 1);
						t_2 = t_1.split(' ');
						if (t_2.length > ct_l)
						{
							es_c = '';
							for (i = 1; i < ct_l + 1; i++)
							{
								es_c += ' ' + t_2[i];
							}
							if (es_c.charAt(es_c.length - 1) == '.' || es_c.charAt(es_c.length - 1) == ',') es_c = es_c.substr(0, es_c.length - 1);
							es_c += ' ...';
							ct_f = false;
						}
					}
				}
				if (ct_f)
				{
					rn = es[2].search(pat);
					t_1 = es[2].substr(rn - (c_s / 5));
					rn = t_1.indexOf(' ');
					if (rn != -1)
					{
						t_1 = t_1.substr(rn + 1);
						t_2 = t_1.split(' ');
						es_c = '';
						if (t_2.length > ct_l)
						{
							for (i = 1; i < ct_l + 1; i++)
							{
								es_c += ' ' + t_2[i];
							}
						}
						else
						{
							for (i = 1; i < t_2.length; i++)
							{
								es_c += ' ' + t_2[i];
							}						
						}
						if (es_c.charAt(es_c.length - 1) == '.' || es_c.charAt(es_c.length - 1) == ',') es_c = es_c.substr(0, es_c.length - 1);
						es_c += ' ...';
					}				
				}
			}
			
			tr[a] = rk + '^' + es[0] + '^' + es[1] + '^' + es_c + '^' + es[2] + '^' + es[3] + '^' + es[4];
			a++;
		}
	}
	tr.sort();
	co = a;
}

if (v_d) co = 0;


// External functions


function tip_query()
{
	if (od != 'undefined' && od != null) document.tipue.d.value = od;
}

function tip_header()
{
	if (co > 0)
	{
		ne = nr + tn;
		if (ne > co) ne = co;
		document.write(tl_12, ' ', tn + 1, ' ', tl_5, ' ', ne, ' ', tl_6, ' ', co, ' ', tl_7 , ' ');
		if (header_links == 1)
		{
			if (t_m == 0)
			{
				hd = hd.replace(/\"/gi, '');
				wt_h = hd.split(' ');
				for (i = 0; i < wt_h.length; i++)
				{
					if (wt_h[i].toLowerCase() != 'or' && wt_h[i].toLowerCase() != 'and' && wt_h[i].toLowerCase() != 'not' && wt_h[i] != '+' && wt_h[i] != '-')
					{
						if (wt_h[i].charAt(0) == '+' || wt_h[i].charAt(0) == '-' || wt_h[i].charAt(0) == '~')
						{
							document.write(wt_h[i].charAt(0));
							wt_h[i] = wt_h[i].slice(1, wt_h[i].length); 
						}
						document.write('<a href="', r_l, '?d=', wt_h[i], '">', wt_h[i], '</a> ');
					}
					else document.write(wt_h[i] + ' ');	
				}
			}
			else document.write(hd);
		}
		else document.write(hd);		
	}
}

function tip_out()
{
	if (cw_l.length > 0)
	{
		document.write(tl_9, ' ', cw_l, '<p>');
	
	}
	if (sp_l.length > 0)
	{
		sp_e = encodeURIComponent(sp_l);
		document.write(tl_8, ' <a class="zero" target="_top" href="', r_l, '?d=', sp_e, '">', sp_l, '</a><p>');	
	}
	if (co == 0)
	{
		if (v_d)
		{
			document.write(tl_10);
		}
		else
		{
			document.write(tl_1);
			if (b_q == 1) document.write('<b>', od, '</b>'); else document.write(od);
			document.write(tl_2);
		}
		return;
	}
	if (tn + nr > co) nd = co; else nd = tn + nr;
	for (a = tn; a < nd; a++)
	{
		os = tr[a].split('^');
		if (b_q == 1 && t_m == 0)
		{
			for (i = 0; i < wt.length; i++)
			{
				pat = new RegExp("\\~", 'i');
				rn = wt[i].search(pat);
				if (rn != -1)
				{
					tw = wt[i].split('~');
					for (c = 0; c < tw.length; c++)
					{
						lw = tw[c].length;
						pat = new RegExp(tw[c], 'i');
						rn = os[3].search(pat);
						if (rn != -1)
						{
							o1 = os[3].slice(0, rn);
							o2 = os[3].slice(rn, rn + lw);
							o3 = os[3].slice(rn + lw);
							os[3] = o1 + '<b>' + o2 + '</b>' + o3; 
						}								
					}
				}
				else
				{
					lw = wt[i].length;
					pat = new RegExp(wt[i], 'i');
					rn = os[3].search(pat);
					if (rn != -1)
					{
						o1 = os[3].slice(0, rn);
						o2 = os[3].slice(rn, rn + lw);
						o3 = os[3].slice(rn + lw);
						os[3] = o1 + '<b>' + o2 + '</b>' + o3; 
					}
				}
			}
		}
		
		if (b_q == 1 && t_m == 1)
		{
			lw = dit.length;
			tw = new RegExp(dit, 'i');
			rn = os[3].search(tw);
			if (rn != -1)
			{
				o1 = os[3].slice(0, rn);
				o2 = os[3].slice(rn, rn + lw);
				o3 = os[3].slice(rn + lw);
				os[3] = o1 + '<b>' + o2 + '</b>' + o3;
			}
		}		
		
		if (include_num == 1) document.write(a + 1, '. ');
		if (os[5] == '0') t_b = '';
		if (os[5] == '1') t_b = 'target="_blank"';
		if (os[5] != '0' && os[5] != '1') t_b = 'target="' + os[5] + '"';
		if (b_t == 0) document.write('<a class="one" target="_top" href="', os[2], '" ', t_b, '>', os[1], '</a>');
		if (b_t == 1)
		{
			lw = dit.length;
			tw = new RegExp(dit, 'i');
			rn = os[1].search(tw);
			if (rn != -1)
			{
				o1 = os[1].slice(0, rn);
				o2 = os[1].slice(rn, rn + lw);
				o3 = os[1].slice(rn + lw);
				os[1] = o1 + '<b>' + o2 + '</b>' + o3;
			}
			document.write('<h3><a class="two" target="_top" href="', os[2], '" ', t_b, '>', os[1], '</a></h3>');
		}
		if (b_t == 2) document.write('<a class="three" target="_top" href="', os[2], '" ', t_b, '><b>', os[1], '</b></a>'); 

		if (os[3].length > 1) document.write('<div>', os[3],'<div>');
		if (include_url == 1) document.write('<div><a class="four" target="_top" href="', os[2], '" ', t_b, '>', os[2], '</a></div><hr/>');
		document.write('<p>');
	}
}

function tip_footer()
{	
	if (co > nr)
	{
		od = encodeURIComponent(od);
		var np = Math.ceil(co / nr);
		nc = co - (tn + nr);
		if (tn > 0) var na = Math.ceil(tn / nr) + 1; else var na = 1;
		if (tn > 1) document.write('<a href="', r_l, '?d=', od, '&n=', tn - nr, '">', tl_3, '</a> &nbsp;');
		if (np < 10)
		{
			for (var i = 0; i < np; i++)
			{
				var nb = nr * i;
				if (nb == tn)
				{
					if (b_f == 1) document.write('<b>', i + 1, '</b> &nbsp;'); else document.write(i + 1, ' &nbsp;');
				}
				else document.write('<a href="', r_l, '?d=', od, '&n=', nb, '">', i + 1, '</a> &nbsp;');
			}
		}
		if (np > 9)
		{
			if (na < 8)
			{
				for (var i = 0; i < 9; i++)
				{
					var nb = nr * i;
					if (nb == tn)
					{
						if (b_f == 1) document.write('<b>', i + 1, '</b> &nbsp;'); else document.write(i + 1, ' &nbsp;');
					}
					else document.write('<a href="', r_l, '?d=', od, '&n=', nb, '">', i + 1, '</a> &nbsp;');
				}
			}
			else
			{
				var ng = na - 5;
				if (np > ng + 9) var nf = ng + 9; else nf = np; 
				for (var i = ng; i < nf; i++)
				{
					var nb = nr * i;
					if (nb == tn)
					{
						if (b_f == 1) document.write('<b>', i + 1, '</b> &nbsp;'); else document.write(i + 1, ' &nbsp;');
					}
					else document.write('<a href="', r_l, '?d=', od, '&n=', nb, '">', i + 1, '</a> &nbsp;');
				}				
			}
		}
		if (nc > 0) document.write('<a href="', r_l, '?d=', od, '&n=', tn + nr, '">', tl_4, '</a>');
	}
	document.write(tl_11);
}


