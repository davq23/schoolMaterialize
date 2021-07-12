function getClassRoomsFromLocalStorage() {
    var classRoomsJSON = localStorage.getItem('classRooms');

    if (classRoomsJSON) {
        classRooms = JSON.parse(classRoomsJSON);
    } else {
        classRooms = {};
    }

    return classRooms;
}

function setClassRoomsToLocalStorage(classRoomsJSON) {
    localStorage.setItem('classRooms', JSON.stringify(classRoomsJSON));
}

function getCurrentPath() {
    return window.location.pathname.split("/").pop();
}

function exportClassRoomXML(classRoom) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString('<classroom></classroom>', 'text/xml');

    xmlDoc.firstElementChild.setAttribute('subjectNumber', classRoom.subjectNumber);
    xmlDoc.firstElementChild.setAttribute('studentNumber', classRoom.studentNumber);

    var fragment = xmlDoc.createDocumentFragment();

    for (var i = 0; i < classRoom.subjectNumber; i++) {
        var currentSubject = xmlDoc.createElement('subject');
        currentSubject.setAttribute('number', i+1);

        if (classRoom['data']) {
            for (var j = 0; j < classRoom.studentNumber; j++) {
                var currentStudent = xmlDoc.createElement('student');

                if (classRoom['data'][(i+1)+'-'+(j+1)]) {
                    currentStudent.appendChild(xmlDoc.createTextNode(classRoom['data'][(i+1)+'-'+(j+1)]))
                    currentStudent.setAttribute('number', j+1);
                }

                currentSubject.appendChild(currentStudent);
            }
        }

        fragment.appendChild(currentSubject);
    }

    xmlDoc.firstElementChild.appendChild(fragment);

    return xmlDoc;
}

function getClassRoomMean(classRoom) {
    var promedio = 0;

    if (classRoom['data']) {
        for (var i = 0; i < classRoom.subjectNumber; i++) {
            for (var j = 0; j < classRoom.studentNumber; j++) {
                var nota = classRoom['data'][(i + 1) + '-' + (j + 1)];
                if (nota) {
                    promedio += parseInt(nota);
                }
            }
        }
    }

    promedio /= (classRoom.subjectNumber * classRoom.studentNumber);

    return promedio;
}

function getStudentMeans(classRoom) {
    var means = [];

    for (var i = 0; i < classRoom.studentNumber; i++) {
        means.push(0);

        if (classRoom['data']) {
            for (var j = 0; j < classRoom.subjectNumber; j++) {
                var nota = classRoom['data'][(j + 1) + '-' + (i + 1)];
                if (nota) {
                    means[i] += parseInt(nota);
                }
            }
        }

        means[i] /= classRoom.subjectNumber;
    }

    return means;
}

function getSubjectMeans(classRoom) {
    var means = [];

    for (var i = 0; i < classRoom.subjectNumber; i++) {
        means.push(0);

        if (classRoom['data']) {
            for (var j = 0; j < classRoom.studentNumber; j++) {
                var nota = classRoom['data'][(i + 1) + '-' + (j + 1)];
                if (nota) {
                    means[i] += parseInt(nota);
                }
            }
        }

        means[i] /= classRoom.studentNumber;
    }

    return means;
}

document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});

    var classRooms = getClassRoomsFromLocalStorage();

    var selectedClassRoom = localStorage.getItem('selectedClassRoom');

    if (document.getElementById('classroom-collection'))
        document.getElementById('classroom-collection').dispatchEvent(new CustomEvent('fill-collection', {
            detail: classRooms,
        }));

    if (selectedClassRoom && document.getElementById('classroom-edition'))
        document.getElementById('classroom-edition').dispatchEvent(new CustomEvent('fill-classroom', {
            detail: classRooms[selectedClassRoom],
        }));

    if (document.getElementById('classroom-analytics'))
        document.getElementById('classroom-analytics').dispatchEvent(new CustomEvent('fill-analytics', {
            detail: classRooms[selectedClassRoom],
        }));

    if (document.getElementById('classroom-analytics-list'))
        document.getElementById('classroom-analytics-list').dispatchEvent(new CustomEvent('fill-collection', {
            detail: classRooms,
        }));

    if (document.getElementById('mean-per-student'))
        document.getElementById('mean-per-student').dispatchEvent(new CustomEvent('fill-analytics', {
            detail: classRooms[selectedClassRoom],
        }));

    if (document.getElementById('mean-per-subject'))
        document.getElementById('mean-per-subject').dispatchEvent(new CustomEvent('fill-analytics', {
            detail: classRooms[selectedClassRoom],
        }));


    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});
});

if (document.getElementById('classroom-edition')) {
    document.getElementById('classroom-edition').addEventListener('fill-classroom', function (event) {
        var classRoom = event.detail;

        if (!classRoom) {
            this.innerText = '';
            return;
        }

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < classRoom.subjectNumber; i++) {
            var divRow = classRoomManager.Elements.Row();

            for (var j = 0; j < classRoom.studentNumber; j++) {
                var divCol = classRoomManager.Elements.Col()

                var label = document.createElement('label');
                label.innerText = 'M ' + (i + 1) + '- E ' + (j + 1);
                var input = classRoomManager.Elements.StudentSubjectCell();

                if (classRoom['data'])
                    input.value = classRoom['data'][(i + 1) + '-' + (j + 1)] ?? '';

                input.setAttribute('col', j + 1);
                input.setAttribute('row', i + 1);

                divCol.appendChild(label);
                divCol.appendChild(input);

                divRow.appendChild(divCol);
            }

            fragment.appendChild(divRow);
        }

        this.innerText = '';
        this.appendChild(fragment);
    });

    document.getElementById('classroom-edition').addEventListener('input', function (event) {
        var classRooms = getClassRoomsFromLocalStorage();

        var row = event.target.getAttribute('row');
        var col = event.target.getAttribute('col');

        if (!row || !col) return;

        if (!classRooms[localStorage.getItem('selectedClassRoom')]['data'])
            classRooms[localStorage.getItem('selectedClassRoom')]['data'] = {};

        classRooms[localStorage.getItem('selectedClassRoom')]['data'][row + '-' + col] = event.target.value;

        setClassRoomsToLocalStorage(classRooms);
    }, {
        capture: true,
    });
}

if (document.getElementById('classroom-analytics')) {
    document.getElementById('classroom-analytics').addEventListener('fill-analytics', function (event) {
        var classRoom = event.detail;

        if (!classRoom) {
            this.innerText = '';
            return;
        }

        this.querySelector('#all-student-mean').value = getClassRoomMean(classRoom);
    })
}

if (document.getElementById('classroom-analytics-list')) {
    document.getElementById('classroom-analytics-list').addEventListener('fill-collection', function (event) {
        var collections = event.detail;

        if (!collections) {
            return;
        }

        var collectionKeys = Object.keys(collections);

        var fragment = document.createDocumentFragment();

        collectionKeys.forEach(function (collectionKey) {
            var item = classRoomManager.Elements.ClassRoomCollectionItem(collectionKey, collections[collectionKey]);

            if (localStorage.getItem('selectedClassRoom') === collectionKey && 
                (getCurrentPath() == 'analitica.html' || getCurrentPath() == 'exportar.html')) {
                item.classList.add('active');
            }

            fragment.appendChild(item);
        });

        this.innerText = '';
        this.appendChild(fragment);
    });

    document.getElementById('classroom-analytics-list').addEventListener('click', function (event) {
        if (event.target.getAttribute('key')) {
            localStorage.setItem('selectedClassRoom', event.target.getAttribute('key'));

            if (getCurrentPath() !== 'analitica.html' && getCurrentPath() != 'exportar.html') {
                window.location = 'analitica.html';
            } else {
                document.dispatchEvent(new Event('DOMContentLoaded'));

            }
        }

    });
}

if (document.getElementById('classroom-collection')) {
    document.getElementById('classroom-collection').addEventListener('fill-collection', function (event) {
        var collections = event.detail;

        if (!collections) {
            return;
        }

        var collectionKeys = Object.keys(collections);

        var fragment = document.createDocumentFragment();

        collectionKeys.forEach(function (collectionKey) {
            var item = classRoomManager.Elements.ClassRoomCollectionItem(collectionKey, collections[collectionKey]);

            if (localStorage.getItem('selectedClassRoom') === collectionKey && getCurrentPath() == 'editar.html') {
                item.classList.add('active');
            }

            fragment.appendChild(item);
        });

        this.innerText = '';
        this.appendChild(fragment);
    });

    document.getElementById('classroom-collection').addEventListener('click', function (event) {
        if (event.target.getAttribute('key')) {
            localStorage.setItem('selectedClassRoom', event.target.getAttribute('key'));


            if (getCurrentPath() !== 'editar.html') {
                window.location = 'editar.html';
            } else {
                document.dispatchEvent(new Event('DOMContentLoaded'));

            }

        }
    }, {
        capture: true,
    });

}


if (document.getElementById('classroom-section'))
    document.getElementById('classroom-section').addEventListener('click', function (event) {
        var change = null;
        switch (event.target.getAttribute('action')) {
            case 'minus':
                change = -1;
            case 'plus':
                if (!change)
                    change = 1;

                var input = event.target.parentElement.querySelector('input');


                if (change < 0 && input.value == 0) {
                    return;
                }

                input.value = parseInt(input.value) + change;
                break;

            case 'create':
                event.target.disabled = true;
                var inputs = this.querySelectorAll('input');

                var newClassRoom = {
                    'studentNumber': inputs[0].value,
                    'subjectNumber': inputs[1].value
                }

                if (newClassRoom['studentNumber'] <= 0 || newClassRoom['subjectNumber'] <= 0) {
                    event.target.disabled = false;
                    M.toast({
                        html: 'Datos inválidos',
                        classes: "red"
                    });
                    break;
                }

                var classRooms = getClassRoomsFromLocalStorage();

                var nextKey = Object.keys(classRooms).length + 1
                while (classRooms[nextKey]) {
                    nextKey = nextKey + 1
                }

                classRooms[nextKey] = newClassRoom;

                localStorage.setItem('classRooms', JSON.stringify(classRooms));

                inputs[0].value = inputs[1].value = 0;

                var item = classRoomManager.Elements.ClassRoomCollectionItem(nextKey, newClassRoom)

                document.getElementById('classroom-collection').appendChild(item);

                event.target.disabled = false;

                break;
        }
    }, {
        capture: true,
    });

if (document.getElementById('mean-per-student')) {
    document.getElementById('mean-per-student').addEventListener('fill-analytics', function (event) {
        var classRoom = event.detail;

        if (!classRoom) {
            this.innerText = '';
            return;
        }

        var means = getStudentMeans(classRoom);
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < means.length; i++) {
            var label = document.createElement('label')
            var input = classRoomManager.Elements.StudentSubjectCell();

            input.readOnly = true;
            label.innerText = 'Estudiante ' + (1 + i)
            input.name = 'estudiante-' + (1 + i);
            label.for = 'estudiante-' + (1 + i);
            input.value = means[i];

            fragment.appendChild(label);
            fragment.appendChild(input);
        }

        this.innerText = '';
        this.appendChild(fragment);
    })
}

if (document.getElementById('mean-per-subject')) {
    document.getElementById('mean-per-subject').addEventListener('fill-analytics', function (event) {
        var classRoom = event.detail;

        if (!classRoom) {
            this.innerText = '';
            return;
        }

        var means = getSubjectMeans(classRoom);
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < means.length; i++) {
            var label = document.createElement('label')
            var input = classRoomManager.Elements.StudentSubjectCell();

            input.readOnly = true;
            label.innerText = 'Materia ' + (1 + i)
            input.name = 'materia-' + (1 + i);
            label.for = 'materia-' + (1 + i);
            input.value = means[i];

            fragment.appendChild(label);
            fragment.appendChild(input);
        }

        this.innerText = '';
        this.appendChild(fragment);
    })
}

var classRoomManager = {
    Elements: {
        ClassRoomCollectionItem: function (key, classRoom) {
            var a = document.createElement('a');

            a.classList.add('collection-item');

            a.setAttribute('key', key);

            a.innerText = classRoom.studentNumber + ' estudiantes, ' +
                classRoom.subjectNumber + ' materias';

            return a;
        },

        StudentSubjectCell: function () {
            var input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.classList.add('text-center');

            return input;
        },

        Row: function () {
            var divRow = document.createElement('div');

            divRow.classList.add('row');

            return divRow;
        },

        Col: function () {
            var divCol = document.createElement('div');

            divCol.classList.add('col');

            return divCol;
        }
    }

}

if (document.getElementById('classroom-data-export')) {
    document.getElementById('classroom-data-export').addEventListener('click', function (event) {
        var selectedClassRoom = localStorage.getItem('selectedClassRoom');
        var classRooms = getClassRoomsFromLocalStorage();
        var exportType = null;

        if (!selectedClassRoom) {
            return;
        }

        switch (event.target.getAttribute('action')) {
            case 'xml-export':
                var xmlObject = exportClassRoomXML(classRooms[selectedClassRoom]);
                exportType = 'text/xml';
                var fetchString = new XMLSerializer().serializeToString(xmlObject.documentElement);

        
            case 'json_export':
                if (!fetchString) {
                    exportType = 'application/json';
                    fetchString = JSON.stringify(classRooms);
                } 

                var blob = new Blob([fetchString], {
                    type: exportType,
                });

                var file = new File([blob], 'classroom', {
                    type: exportType,
                })
                break;
        }
    });
}