# Download e build
------------------

Se você já tem o npm instalado, basta fazer:

* Instalar o ionic globalmente
```
$ sudo npm -g install ionic
```

* Clonar o repositório
```
$ git clone https://github.com/hacklabr/viradapp.git
```

* Fazer o build padrão
```
$ cd viradapp
$ npm install
$ gulp install # runs bower install
```

* Fazer o setup SASS
```
$ ionic setup sass
```

* Rodar
```
$ ionic serve
```

* Para rodar no navegador, adicione um proxy com

```
$ gulp add-proxy 
```

Ele vai te dar uma url padrão e abrir o navegador automaticamente! 

# Editando
----------

Na raiz do projeto você terá o diretorio scss onde ficará seu sass. só editar!
O ionic serve já faz o watch dos arquivos, recompila na alteração e faz o 
livereolad

* Resources
  * http://ionicframework.com/docs/cli/sass.html
  * http://learn.ionicframework.com/formulas/working-with-sass/
  * http://ionicframework.com/docs/components

# Rodando no celular Android ou Emulador

Para isso, você precisará ter a SDK Android instalada

* Instala o phonegap
```
$ npm install phonegap
```

* Adiciona a plataforma android ao projeto (aqui, se a SDK não estiver
instalada já haverá falha)
```
$ ionic platform add android
```

* Remove o proxy adicionado
```
$ gulp remove-proxy
```

* Aqui, precisamos ter um dispositivo plugado ao computador aceitando 
instalação de fontes desconhecidas e com o modo desenvolvedor ativado.
```
$ ionic run android
```

* Para emular, é necessário que se crie um disposivo usando o Android SDK Manager
```
$ android
```

* Uma vez criado o dispositivo
```
$ ionic emulate android
```

# Limpando binários para ios

```
$ bash clean_execs.sh
```

