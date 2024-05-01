window.jsPDF = window.jspdf.jsPDF;
const PRIMARY_COLOR = '#171f27';
let doc;

async function getDataUri(url, dWidth, dHeight) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'annonymus';
    image.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = dWidth;
      canvas.height = dHeight;

      const aspectRatio = this.naturalWidth / this.naturalHeight;
      let imgWidth = dWidth;
      let imgHeight = dHeight;
      if (aspectRatio > 1) {
        imgWidth = dWidth * aspectRatio;
      } else {
        imgHeight = dHeight / aspectRatio;
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(this, -(imgWidth - dWidth) / 2, -(imgHeight - dHeight) / 2, imgWidth, imgHeight);

      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(dWidth * 0.5, dHeight * 0.5, dWidth * 0.5, 0, 2 * Math.PI);
      ctx.fill();

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = function () {
      resolve(EMPTY_IMAGE);
    };
    image.src = url;
  });
}

function getQrCodeUri(text) {
  const qrContainer = document.createElement('div');
  new QRCode(qrContainer, text);
  return qrContainer.querySelector('canvas').toDataURL('image/png');
}

function downloadIdCard() {
  if (doc) {
    doc.save('id-card.pdf');
  }
}

async function generateIdCard(data) {
  doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [2.125, 3.375],
  });

  // add fonts
  doc.addFileToVFS('Poppins-Bold', POPPINS_BOLD);
  doc.addFont('Poppins-Bold', 'Poppins', 'bold');
  doc.addFileToVFS('Poppins-Medium', POPPINS_MEDIUM);
  doc.addFont('Poppins-Medium', 'Poppins', 'medium');

  for (const [i, employee] of data.entries()) {
    if (i > 0) {
      doc.addPage();
    }

    doc.addImage(LOGO_URI, 0.807, 0.05, 0.51, 0.51);

    // add company name & address
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text('CREATIVE WORKS COMPANY', 1.0625, 0.733, null, null, 'center');
    doc.setFont('Poppins', 'medium');
    doc.setFontSize(5.5);
    doc.text('Tinkune-10, Koteshwor, Kathmandu', 1.0625, 0.843, null, null, 'center');

    // create background shape
    doc.setFillColor(PRIMARY_COLOR);
    doc.triangle(0, 1.68, 2.125, 1.18, 2.125, 1.68, 'F');
    doc.rect(0, 1.68, 2.125, 1.697, 'F');

    // profile image
    doc.setFillColor('#fff');
    doc.circle(1.063, 1.447, 0.473, 'F');
    const profileUri = await getDataUri(employee.image, 400, 400);
    doc.addImage(profileUri, 0.633, 1.015, 0.86, 0.86);

    // add employee name and designation
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(9);
    doc.setTextColor('#fff');
    doc.text(employee.name.toUpperCase(), 1.0625, 2.15, null, null, 'center');
    doc.setFont('Poppins', 'medium');
    doc.setFontSize(5.5);
    doc.text(employee.designation, 1.0625, 2.267, null, null, 'center');

    doc.setFontSize(6);
    const employeeInfo = [
      {
        label: 'Staff Id',
        value: employee.id,
      },
      {
        label: 'Address',
        value: employee.address,
      },
      {
        label: 'Phone',
        value: employee.phone,
      },
      {
        label: 'Valid Until',
        value: '2023-12-30',
      },
    ];
    employeeInfo.forEach((item, i) => {
      doc.text(item.label, 0.3, 2.583 + 0.167 * i);
      doc.text(':', 0.76, 2.583 + 0.167 * i);
      doc.text(item.value, 0.813, 2.583 + 0.167 * i);
    });

    doc.rect(1.578, 2.846, 0.433, 0.433, 'F');
    const qrCodeUri = getQrCodeUri(employee.id);
    doc.addImage(qrCodeUri, 1.613, 2.882, 0.366, 0.366);
  }

  document.getElementById('idcard-preview').setAttribute('src', URL.createObjectURL(doc.output('blob')));
}
