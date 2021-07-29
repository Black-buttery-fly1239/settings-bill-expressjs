const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const SettingsBill = require('./settings-bill');

const handlebarSetup = exphbs({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts',
});

var moment = require('moment'); 
moment().format();

const app = express();
const settingsBill = SettingsBill()

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {

    
    let className = '';
    
    
    if(settingsBill.hasReachedWarningLevel()){
        className = 'warning'
    }
    
    if(settingsBill.hasReachedCriticalLevel()){
        className = 'danger'
    }
    
    res.render('index', {
        
        settings: settingsBill.getSettings(),
        totals: settingsBill.totals(),
        classTotals: className
    });
});

app.post('/settings', function (req, res) {
    // console.log(req.body);
    
    settingsBill.setSettings({
        
        callCost: req.body.callCost,
        smsCost: req.body.smsCost,
        warningLevel: req.body.warningLevel,
        criticalLevel: req.body.criticalLevel,
    })
    res.redirect('/');
    
});

app.post('/action', function (req, res) {
    // console.log(req.body.actionType);
    
    settingsBill.recordAction(req.body.actionType)
    res.redirect('/');
});

app.get('/actions', function (req, res){

    var theAction = settingsBill.actions();
    theAction.forEach(element => {
        element.theTime = moment(element.timestamp).fromNow()
    });

    res.render('actions', {
         actions: theAction
         });
});

app.get('/actions/:actionType', function (req, res) {


    const actionType = req.params.actionType ;
    res.render('actions', { actions: settingsBill.actionsFor(actionType) })
});

// app.get("/", (req, res) => {

//  if(settingsBill.hasReachedWarningLevel()){
//      className = 'warning'
//  }

//  if(settingsBill.hasReachedCriticalLevel()){
//      className = 'danger'
//  }


// })

const PORT = process.env.PORT || 3011;

app.listen(PORT, function () {
    console.log("App started 3011")
});