var express = require('express');
var router = express.Router();
var app = express();

var ctrlDashboard = require('../controllers/Dashboard');

/* GET home page. */

/*	Dashboard pages	*/
//router.get('/', ctrlDashboard.index);
router.get('/', ctrlDashboard.rov_Charts);
router.get('/Contact', ctrlDashboard.contact);
router.get('/Methodology', ctrlDashboard.methodology);

/*      RPKI ROV (IPV4, IPV6) pages      */
router.get('/ROV', ctrlDashboard.rov_Charts);
router.get('/ROV/:Time/:RIR/:Collector/:Version', ctrlDashboard.rov_Param);

/* Pages for Valid data according to RPKI ROV	*/
router.get('/Val', ctrlDashboard.valid_Charts);
router.get('/Val/:Time/:RIR/:Collector/:Version', ctrlDashboard.valid_Param);

/* Pages for Valid data according to RPKI ROV   */
router.get('/NF', ctrlDashboard.notfound_Charts);
router.get('/NF/:Time/:RIR/:Collector/:Version', ctrlDashboard.notfound_Param);

/* Pages for Valid data according to RPKI ROV   */
router.get('/Inv', ctrlDashboard.invalid_Charts);
router.get('/Inv/:Time/:RIR/:Collector/:Version', ctrlDashboard.invalid_Param);

/* Coverage Pages */
router.get('/Cov', ctrlDashboard.coverage_Charts);
router.get('/CovD', ctrlDashboard.coverage_Details_Charts);
router.get('/Cov_RIR', ctrlDashboard.coverage_rir_Charts);
router.get('/Cov_Val', ctrlDashboard.coverage_validation_Charts);
router.get('/Cov_Pref', ctrlDashboard.coverage_invalids_Chart);
router.get('/Cov/:Time/:Version/:Page', ctrlDashboard.coverage_invalids_Charts);
/*	In this case Collector = Invalid Type	*/
router.get('/Cov/:Time/:RIR/:Collector/:Version', ctrlDashboard.coverage_Param);
router.get('/CovD/:Time/:RIR/:Collector/:Version', ctrlDashboard.coverage_Details_Param);
router.get('/Cov_RIR/:Time/:RIR/:Collector/:Version', ctrlDashboard.coverage_rir_Param);
router.get('/Cov_Val/:Time/:RIR/:Collector/:Version', ctrlDashboard.coverage_validation_Param);
router.get('/CovO/:Time/:RIR/:Collector/:Version/:Origin', ctrlDashboard.coverage_invalids_Param);
router.get('/CovPr/:Time/:Version/:Prefix', ctrlDashboard.coverage_One_Prefix);

/*	ROV Validation Changes	*/
router.get('/ROVChang', ctrlDashboard.rov_time_changes);
router.get('/ROVChang/:Time1/:Time2', ctrlDashboard.rov_all_changes);
router.get('/ROVChang/:Time1/:Time2/:Version/:Validation1/:Validation2', ctrlDashboard.filtered_rov_changes);

/*      ROA Prefix Changes  */
router.get('/ROAChang', ctrlDashboard.roa_time_changes);
router.get('/ROAChang/:Time1/:Time2', ctrlDashboard.roa_all_changes);

/* Prefix Validation Changes	*/
router.get('/PrefixVal', ctrlDashboard.prefix_selection);
router.get('/PrefixOVal/:Prefix', ctrlDashboard.prefix_Validation_Chart);
router.get('/ROAs/:Time/:ROA', ctrlDashboard.roa);
router.get('/Certs/:Time/:Cert/:Hierarchy', ctrlDashboard.certificate);
router.get('/More/:Prefix/:From/:To', ctrlDashboard.more_Prefixes);
router.get('/Less/:Prefix/:From/:To', ctrlDashboard.less_Prefixes);


router.get('/ROAPrefix', ctrlDashboard.prefix_roa_selection);
router.get('/ROAPrefix/:Prefix/:Origin/:Time/', ctrlDashboard.roa_prefix);

/* Repository Analysis  */
router.get('/RPKI', ctrlDashboard.repository_Charts);
router.get('/RPKI/:Time/:RIR', ctrlDashboard.repository_Param);

module.exports = router;
