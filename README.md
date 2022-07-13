# proskomma-json-tools
Tools for working with Proskomma-derived JSON formats such as PERF and SOFRIA

## Usage
```
npm install proskomma-json-tools
import {perf2usfm} from 'proskomma-json-tools';
// ...
const usfm = perf2usfm(perf);
```
## Generate Schema Documentation
Using the Python json schema generator https://github.com/coveooss/json-schema-for-humans :
```
generate-schema-doc src/schema/combined/0_2_1/perf_document_combined.json doc/schema/perf.html
generate-schema-doc src/schema/combined/0_2_1/sofria_document_combined.json doc/schema/sofria.html
```
