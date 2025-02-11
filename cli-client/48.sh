se2448 healthcheck
se2448 resetpasses
se2448 healthcheck
se2448 resetstations
se2448 healthcheck
se2448 admin --addpasses --source passes48.csv
se2448 healthcheck
se2448 tollstationpasses --station AM08 --from 20220407 --to 20220421 --format json
se2448 tollstationpasses --station NAO04 --from 20220407 --to 20220421 --format csv
se2448 tollstationpasses --station NO01 --from 20220407 --to 20220421 --format csv
se2448 tollstationpasses --station OO03 --from 20220407 --to 20220421 --format csv
se2448 tollstationpasses --station XXX --from 20220407 --to 20220421 --format csv
se2448 tollstationpasses --station OO03 --from 20220407 --to 20220421 --format YYY
se2448 errorparam --station OO03 --from 20220407 --to 20220421 --format csv
se2448 tollstationpasses --station AM08 --from 20220408 --to 20220419 --format json
se2448 tollstationpasses --station NAO04 --from 20220408 --to 20220419 --format csv
se2448 tollstationpasses --station NO01 --from 20220408 --to 20220419 --format csv
se2448 tollstationpasses --station OO03 --from 20220408 --to 20220419 --format csv
se2448 tollstationpasses --station XXX --from 20220408 --to 20220419 --format csv
se2448 tollstationpasses --station OO03 --from 20220408 --to 20220419 --format YYY
se2448 passanalysis --stationop AM --tagop NAO --from 20220407 --to 20220421 --format json
se2448 passanalysis --stationop NAO --tagop AM --from 20220407 --to 20220421 --format csv
se2448 passanalysis --stationop NO --tagop OO --from 20220407 --to 20220421 --format csv
se2448 passanalysis --stationop OO --tagop KO --from 20220407 --to 20220421 --format csv
se2448 passanalysis --stationop XXX --tagop KO --from 20220407 --to 20220421 --format csv
se2448 passanalysis --stationop AM --tagop NAO --from 20220408 --to 20220419 --format json
se2448 passanalysis --stationop NAO --tagop AM --from 20220408 --to 20220419 --format csv
se2448 passanalysis --stationop NO --tagop OO --from 20220408 --to 20220419 --format csv
se2448 passanalysis --stationop OO --tagop KO --from 20220408 --to 20220419 --format csv
se2448 passanalysis --stationop XXX --tagop KO --from 20220408 --to 20220419 --format csv
se2448 passescost --stationop AM --tagop NAO --from 20220407 --to 20220421 --format json
se2448 passescost --stationop NAO --tagop AM --from 20220407 --to 20220421 --format csv
se2448 passescost --stationop NO --tagop OO --from 20220407 --to 20220421 --format csv
se2448 passescost --stationop OO --tagop KO --from 20220407 --to 20220421 --format csv
se2448 passescost --stationop XXX --tagop KO --from 20220407 --to 20220421 --format csv
se2448 passescost --stationop AM --tagop NAO --from 20220408 --to 20220419 --format json
se2448 passescost --stationop NAO --tagop AM --from 20220408 --to 20220419 --format csv
se2448 passescost --stationop NO --tagop OO --from 20220408 --to 20220419 --format csv
se2448 passescost --stationop OO --tagop KO --from 20220408 --to 20220419 --format csv
se2448 passescost --stationop XXX --tagop KO --from 20220408 --to 20220419 --format csv
se2448 chargesby --opid NAO --from 20220407 --to 20220421 --format json
se2448 chargesby --opid GE --from 20220407 --to 20220421 --format csv
se2448 chargesby --opid OO --from 20220407 --to 20220421 --format csv
se2448 chargesby --opid KO --from 20220407 --to 20220421 --format csv
se2448 chargesby --opid NO --from 20220407 --to 20220421 --format csv
se2448 chargesby --opid NAO --from 20220408 --to 20220419 --format json
se2448 chargesby --opid GE --from 20220408 --to 20220419 --format csv
se2448 chargesby --opid OO --from 20220408 --to 20220419 --format csv
se2448 chargesby --opid KO --from 20220408 --to 20220419 --format csv
se2448 chargesby --opid NO --from 20220408 --to 20220419 --format csv