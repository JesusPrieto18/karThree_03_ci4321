export let vertices: Float32Array;
export let faces: number[];
export let colors: Float32Array;

vertices = new Float32Array([
     3, 2, 3, // v0 |esquina inferior derecha C1
    -3, 2, 3, // v1 |esquina inferior izquierda C1
     3, 2,-3, // v2 |esquina superior derecha C1
    -3, 2,-3, // v3 | esquina superior derecha C1
     2, 2, 2, // v4 | esquina inferior derecha C2
     2, 2,-2, // v5 | esquina superior derecha C2
    -2, 2,-2, // v6 | esquina superior izquierda C2
    -2, 2, 2, // v7 | esquina inferior izquierda C2
     3, 2, 2, // v8  | Derecha de v4
     2, 2, 3, // v9  | Abajo de v4
     3, 2,-2, // v10 | Derecha de v5
     2, 2,-3, // v11 | Arriba de v5
    -2, 2,-3, // v12 | Arriba de v6
    -3, 2,-2, // v13 | Izquierda de v6
    -3, 2, 2, // v14 | Izquierda de v7
    -2, 2, 3, // v15 | Abajo de v7
     1,2, 1, // v16 | Esquina inferior derecha C3
     1,2,-1, // v17 | Esquina superior derecha C3
    -1,2,-1, // v18 | Esquina superior izquierda C3
    -1,2, 1, // v19 | Esquina inferior izquierda C3
     1.5,2,   0, // v20 | Mediana entre V16 y V17
       0,2, 1.5, // v21 | Mediana entre V16 y V19
    -1.5,2,   0, // v22 | Mediana entre V18 y V19
       0,2,-1.5, // v23 | Mediana entre V17 y V18
     2, 2, 1, // v24 | Arriba de v4
     1, 2, 2, // v25 | Izquierda de v4
     2, 2,-1, // v26 | Abajo de v5
     1, 2,-2, // v27 | Izquierda de v5
    -1, 2,-2, // v28 | Derecha de v6
    -2, 2,-1, // v29 | Abajo de v6
    -2, 2, 1, // v30 | Arriba de v7
    -1, 2, 2, // v31 | Derecha de v7
     3,2,-6, // v32 | Punta Arriba
     6,2, 3, // v33 | Punta Derecha
    -3,2, 6, // v34 | Punta Abajo
    -6,2,-3, // v35 | Punta Izquierda
     3,2, 0, // v36 | Centro Derecha
     0,2, 3, // v37 | Centro Abajo
    -3,2, 0, // v38 | Centro Izquierda
     0,2,-3, // v39 | Centro Arriba
    // Cara de abajo
    
     3, 1, 3, // v40 |esquina inferior derecha C1
    -3, 1, 3, // v41 |esquina inferior izquierda C1
     3, 1,-3, // v42 |esquina superior derecha C1
    -3, 1,-3, // v43 | esquina superior derecha C1
     2, 1, 2, // v44 | esquina inferior derecha C2
     2, 1,-2, // v45 | esquina superior derecha C2
    -2, 1,-2, // v46 | esquina superior izquierda C2
    -2, 1, 2, // v47 | esquina inferior izquierda C2
     3, 1, 2, // v48 | Derecha de v4
     2, 1, 3, // v49 | Abajo de v4
     3, 1,-2, // v50 | Derecha de v5
     2, 1,-3, // v51 | Arriba de v5
    -2, 1,-3, // v52 | Arriba de v6
    -3, 1,-2, // v53 | Izquierda de v6
    -3, 1, 2, // v54 | Izquierda de v7
    -2, 1, 3, // v55 | Abajo de v7
     1,1, 1, // v56 | Esquina inferior derecha C3
     1,1,-1, // v57 | Esquina superior derecha C3
    -1,1,-1, // v58 | Esquina superior izquierda C3
    -1,1, 1, // v59 | Esquina inferior izquierda C3
     1.5,1,   0, // v60 | Mediana entre V16 y V17
       0,1, 1.5, // v61 | Mediana entre V16 y V19
    -1.5,1,   0, // v62 | Mediana entre V18 y V19
       0,1,-1.5, // v63 | Mediana entre V17 y V18
     2, 1, 1, // v64 | Arriba de v4
     1, 1, 2, // v65 | Izquierda de v4
     2, 1,-1, // v66 | Abajo de v5
     1, 1,-2, // v67 | Izquierda de v5
    -1, 1,-2, // v68 | Derecha de v6
    -2, 1,-1, // v69 | Abajo de v6
    -2, 1, 1, // v70 | Arriba de v7
    -1, 1, 2, // v71 | Derecha de v7
     3,1,-6, // v72 | Punta Arriba
     6,1, 3, // v73 | Punta Derecha
    -3,1, 6, // v74 | Punta Abajo
    -6,1,-3, // v75 | Punta Izquierda
     3,1, 0, // v76 | Centro Derecha
     0,1, 3, // v77 | Centro Abajo
    -3,1, 0, // v78 | Centro Izquierda
     0,1,-3, // v79 | Centro Arriba
]);

faces = [
    // Cara de arriba
    9,8,4,    // C1
    9,0,8,    // C1
    1,15,14,  // C2
    15,7,14,  // C2    
    10,2,11,  // C3
    5,10,11,  // C3
    13,12,3,  // C4
    13,6,12,  // C4
    15,4,7, // R1-5
    15,9,4, // R1-5
    14,6,13, // R2-6
    14,7,6,  // R2-6
    6,11,12, // R3-7
    6,5,11,  // R3-7
    4,10,5, // R4-8
    4,8,10, // R4-8
    17,5,27, // C9
    17,26,5, // C9
    25,24,16, // C10
    25,4,24,  // C10
    7,19,30, // C11
    7,31,19, // C11
    29,28,6, // C12
    29,18,28, // C12
    30,22,29, // Estrella izquierda
    28,23,27, // Estrella arriba
    20,24,26, // Estrella derecha
    31,25,21, // Estrella abajo
    39,2,32, // Punta arriba
    36,0,33, // Punta derecha
    1,34,37, // Punta abajo
    35,38,3, // Punta izquierda  
    
    // Cara de abajo
    49,48,40,    // C1
    44,48,49,    // C1
    41,54,55,  // C2
    54,47,55,  // C2    
    42,50,51,  // C3
    50,45,51,  // C3
    43,52,53,  // C4
    52,46,53,  // C4
    47,44,55, // R1-5
    55,44,49, // R1-5
    53,46,54, // R2-6
    54,46,47,  // R2-6
    52,51,46, // R3-7
    46,51,45,  // R3-7
    45,50,44, // R4-8
    44,50,48, // R4-8
    67,45,57, // C9
    57,45,66, // C9
    56,64,65, // C10
    65,64,44,  // C10
    70,59,47, // C11
    47,59,71, // C11
    46,68,69, // C12
    69,68,58, // C12
    69,62,70, // Estrella izquierda
    68,67,63, // Estrella arriba
    60,66,64, // Estrella derecha
    71,61,65, // Estrella abajo
    79,72,42, // Punta arriba
    76,73,40, // Punta derecha
    41,77,74, // Punta abajo
    75,43,78, // Punta izquierda
    // Caras laterales
    77,73,33,  // Abajo derecha
    77,33,37,  // Abajo derecha
    77,37,34,  // Abajo izquierda
    34,74,77,  // Abajo izquierda
    76,36,73,  // Derecha abajo
    73,36,33,  // Derecha abajo
    
    76,32,36, // Derecha arriba
    76,72,32, // Derecha arriba
    79,39,32, // Arriba derecha
    72,79,32,  // Arriba derecha
    79,35,39, // Arriba izquierda
    79,75,35, // Arriba izquierda
    75,38,35, // Izquierda arriba
    75,78,38, // Izquierda arriba
    78,74,34,  // Izquierda abajo
    78,34,38,  // Izquierda abajo
    // Caras laterales centro
    25,61,21, // Abajo derecha 21-25
    25,65,61, // Abajo derecha 21-25
    25,16,56, // Abajo derecha 26-16
    56,65,25, // Abajo derecha
    31,21,61, // Abajo izquierda 31-21
    61,71,31, // Abajo izquierda
    31,59,19, // Abajo izquierda 31-59
    31,71,59, // Abajo izquierda
    30,19,59, // Izquierda abajo 30-19
    59,70,30, // Izquierda abajo
    30,70,62, // Izquierda abajo 30-70
    30,62,22, // Izquierda abajo
    22,69,29, // Izquierda arriba 22 -69
    22,62,69, // Izquierda arriba
    29,69,58, // Izquierda arriba 29-69
    29,58,18, // Izquierda arriba
    28,18,58, // Arriba izquierda 28-18
    58,68,28, // Arriba izquierda
    28,68,63, // Arriba izquierda 28-68
    28,63,23, // Arriba izquierda
    
    27,23,63, // Arriba derecha 27-23
    63,67,27, // Arriba derecha
    27,67,57, // Arriba derecha 27-67
    27,57,17, // Arriba derecha
    26,17,57, // Derecha arriba
    26,57,66, // Derecha arriba
    20,26,66, // Derecha arriba
    66,60,20, // Derecha arriba
    24,20,60, // Derecha abajo
    60,64,24, // Derecha abajo
    16,24,64, // Derecha abajo
    64,56,16, // Derecha abajo
];
colors = new Float32Array([
    93/255, 83/255, 141/255,   // v0  - morado oscuro
    80/255, 70/255, 160/255,   // v1
    70/255, 60/255, 180/255,   // v2
    60/255, 50/255, 200/255,   // v3
    80/255, 90/255, 180/255,   // v4
    70/255, 110/255, 200/255,  // v5
    60/255, 130/255, 220/255,  // v6
    50/255, 150/255, 240/255,  // v7
    100/255, 100/255, 180/255, // v8
    120/255, 110/255, 170/255, // v9
    90/255, 120/255, 200/255,  // v10
    80/255, 130/255, 210/255,  // v11
    70/255, 140/255, 220/255,  // v12
    60/255, 150/255, 230/255,  // v13
    100/255, 80/255, 160/255,  // v14
    120/255, 70/255, 150/255,  // v15
    110/255, 60/255, 170/255,  // v16
    90/255, 50/255, 190/255,   // v17
    70/255, 40/255, 210/255,   // v18
    50/255, 30/255, 230/255,   // v19
    80/255, 60/255, 200/255,   // v20
    60/255, 80/255, 220/255,   // v21
    40/255, 100/255, 240/255,  // v22
    30/255, 120/255, 255/255,  // v23
    100/255, 120/255, 200/255, // v24
    120/255, 140/255, 180/255, // v25
    140/255, 160/255, 160/255, // v26
    160/255, 180/255, 140/255, // v27
    180/255, 200/255, 120/255, // v28
    200/255, 220/255, 100/255, // v29
    180/255, 160/255, 140/255, // v30
    160/255, 140/255, 160/255, // v31
    140/255, 120/255, 180/255, // v32
    120/255, 100/255, 200/255, // v33
    100/255, 80/255, 220/255,  // v34
    80/255, 60/255, 240/255,   // v35
    60/255, 40/255, 255/255,   // v36
    80/255, 60/255, 240/255,   // v37
    100/255, 80/255, 220/255,  // v38
    120/255, 100/255, 200/255, // v39
    93/255, 83/255, 141/255,   // v40  - morado oscuro
    80/255, 70/255, 160/255,   // v41
    70/255, 60/255, 180/255,   // v42
    60/255, 50/255, 200/255,   // v43
    80/255, 90/255, 180/255,   // v44
    70/255, 110/255, 200/255,  // v45
    60/255, 130/255, 220/255,  // v46
    50/255, 150/255, 240/255,  // v47
    100/255, 100/255, 180/255, // v48
    120/255, 110/255, 170/255, // v49
    90/255, 120/255, 200/255,  // v50
    80/255, 130/255, 210/255,  // v51
    70/255, 140/255, 220/255,  // v52
    60/255, 150/255, 230/255,  // v53
    100/255, 80/255, 160/255,  // v54
    120/255, 70/255, 150/255,  // v55
    110/255, 60/255, 170/255,  // v56
    90/255, 50/255, 190/255,   // v57
    70/255, 40/255, 210/255,   // v58
    50/255, 30/255, 230/255,   // v59
    80/255, 60/255, 200/255,   // v60
    60/255, 80/255, 220/255,   // v61
    40/255, 100/255, 240/255,  // v62
    30/255, 120/255, 255/255,  // v63
    100/255, 120/255, 200/255, // v64
    120/255, 140/255, 180/255, // v65
    140/255, 160/255, 160/255, // v66
    160/255, 180/255, 140/255, // v67
    180/255, 200/255, 120/255, // v68
    200/255, 220/255, 100/255, // v69
    180/255, 160/255, 140/255, // v70
    160/255, 140/255, 160/255, // v71
    140/255, 120/255, 180/255, // v72
    120/255, 100/255, 200/255, // v73
    100/255, 80/255, 220/255,  // v74
    80/255, 60/255, 240/255,   // v75
    60/255, 40/255, 255/255,   // v76
    80/255, 60/255, 240/255,   // v77
    100/255, 80/255, 220/255,  // v78
    120/255, 100/255, 200/255, // v79
]);