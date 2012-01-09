<?php

    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-type: application/json');
    
    $json = array();
    $query = "";

    if (isset($_GET['q']))
    {
        $json['query'] = $_GET['q'];
        $json['method'] = 'get';
    }
    else if (isset($_POST['q']))
    {
        $json['query'] = $_POST['q'];
        $json['method'] = 'post';
    }
    
    function getResponse0($q)
    {
        $json['content'] = array();
        $json['content'][] = array("v" => $q . " suggestion 1");        
        $json['content'][] = array("v" => $q . " suggestion 2");        
        $json['content'][] = array("v" => $q . " suggestion 3");        
        $json['content'][] = array("v" => $q . " suggestion 4");
        $json['content'][] = array("v" => "go to google",
                                   "t" => "directLink",
                                   "u" => "http://www.google.fr/ig");
        return $json;
    }
    
    function getResponse1($q)
    {
        $json['content'] = array();
        
        $json['content'][] = array("v" => $q . " suggestion 1");        
        $json['content'][] = array("v" => $q . " suggestion 2");
        $json['content'][] = array("v" => "go to koreus",
                                   "t" => "directLink",
                                   "u" => "http://www.koreus.com/modules/news/",
                                   "vo" => $q . " à retrouver sur koreus");
        
        return $json;
    }
    
    function getResponse2($q)
    {
        $json['content'] = array();
        
        $json['content'][] = array("v" => "Suggestions",
                                   "t" => "label");
        $json['content'][] = array("v" => $q . " suggestion 1");        
        $json['content'][] = array("v" => $q . " suggestion 2");
        $json['content'][] = array("v" => $q . " suggestion 3");
        
        $json['content'][] = array("v" => "Direct access",
                                   "t" => "label");
        
        $json['content'][] = array("v" => "go to orange.fr",
                                   "t" => "directLink",
                                   "u" => "http://www.orange.fr/");
        $json['content'][] = array("v" => "lien vers php.net/" . $q,
                                   "t" => "directLink",
                                   "u" => "http://fr2.php.net/". $q);
        
        return $json;
    }
    
    // Loop to update completion result
    echo json_encode(call_user_func_array('getResponse' . (mb_strlen($json['query']) % 3), array($json['query'])));
