var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    const url = req.url == '/' ? '/?page=1' : req.url
    const { page = 1, name, height, weight, starDate, endDate, isMarried, search } = req.query;

    const wheres = [];
    const params = [];
    const count = [];
    const limit = 5;
    const offset = (page - 1) * limit;

    if (name) {
        wheres.push('name like "%" || ? || "%"')
        params.push(name)
        count.push(name)
    }

    if (height) {
        wheres.push('height = ?')
        params.push(height)
        count.push(height)
    }

    if (weight) {
        wheres.push('weight = ?')
        params.push(weight)
        count.push(weight)
    }

    if (starDate && endDate) {
        wheres.push(`birthdate BETWEEN ? and ?`)
        params.push(starDate, endDate)
        count.push(starDate, endDate)
    } else if (starDate) {
        wheres.push('birthdate >= ?')
        params.push(starDate)
        count.push(starDate)
    } else if (endDate) {
        wheres.push('birthdate <= ?')
        params.push(endDate)
        count.push(endDate)
    }

    if (isMarried) {
        wheres.push('married = ?')
        params.push(isMarried)
        count.push(isMarried);
    }

    let sqlCount = 'SELECT COUNT(*) AS total FROM data';
    let sql = 'SELECT * FROM data';

    if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(` ${search} `)}`
        sqlCount += ` WHERE ${wheres.join(` ${search} `)}`
    }

    sql += ' ORDER BY id LIMIT ? OFFSET ?'
    params.push(limit, offset)

    db.get(sqlCount, count, (err, rows) => {
        const total = rows.total
        const pages = Math.ceil(total / limit)

        db.all(sql, params, (err, rows) => {
            if (err) res.send(err)
            else res.render('read', { rows, page: Number(page), pages, offset, query: req.query, url })
        })
    })
})

router.get('/add', (req, res) => {
    const header = 'Adding Data'
    res.render('form', { rows: {}, header })
})

router.post('/add', (req, res) => {

    db.run('INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)',
        [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.isMarried], (err) => {
            if (err) res.send(err)
            else res.redirect('/')
        })
})

router.get('/edit/:id', (req, res) => {
    const id = req.params.id
    const header = 'Updating Data'
    db.get('SELECT * FROM data WHERE id = ?', [id], (err, rows) => {
        if (err) res.send(err)
        else res.render('form', { rows, header })
    })
})

router.post('/edit/:id', (req, res) => {
    const id = req.params.id
    db.run('UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?',
        [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.isMarried, id], (err) => {
            if (err) res.send(err)
            else res.redirect('/')
        })
})

router.get('/delete/:id', (req, res) => {
    const id = req.params.id
    db.get('DELETE FROM data WHERE id = ?', [id], (err, rows) => {
        if (err) res.send(err)
        else res.redirect('/')
    })
})


module.exports = router;