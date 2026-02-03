<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Información PHP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        
        .info-box {
            background: #f4f4f4;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #333;
        }
        
        a {
            display: inline-block;
            background: #333;
            color: #FFF;
            padding: 10px 20px;
            text-decoration: none;
            margin-top: 20px;
        }
        
        a:hover {
            background: #555;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: #333;
            color: #FFF;
        }
    </style>
</head>
<body>
    <h1>Información del Servidor PHP</h1>
    
    <div class="info-box">
        <h3>Versión de PHP</h3>
        <p><?php echo phpversion(); ?></p>
    </div>
    
    <div class="info-box">
        <h3>Sistema Operativo</h3>
        <p><?php echo php_uname(); ?></p>
    </div>
    
    <div class="info-box">
        <h3>Servidor Web</h3>
        <p><?php echo $_SERVER['SERVER_SOFTWARE']; ?></p>
    </div>
    
    <h2>Extensiones PHP Instaladas</h2>
    <table>
        <tr>
            <th>Extensión</th>
            <th>Versión</th>
        </tr>
        <?php 
        $extensions = get_loaded_extensions();
        sort($extensions);
        foreach($extensions as $ext): 
            $version = phpversion($ext);
        ?>
        <tr>
            <td><?php echo $ext; ?></td>
            <td><?php echo $version ? $version : '-'; ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
    
    <a href="index.html">← Volver al inicio</a>
</body>
</html>