// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Toggle GST (18%) display for prices when "Display total before taxes" switch is used
document.addEventListener('DOMContentLoaded', () => {
  const gstRate = 0.18
  const toggle = document.getElementById('totalToggle')
  if (!toggle) return

  const priceNodes = Array.from(document.querySelectorAll('.price-value[data-base-price]'))
  const gstLabels = Array.from(document.querySelectorAll('.gst-label'))

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString('en-IN')
  }

  const updatePrices = (includeGst) => {
    priceNodes.forEach(node => {
      const base = Number(node.dataset.basePrice || 0)
      const finalPrice = includeGst ? base * (1 + gstRate) : base
      node.textContent = formatPrice(finalPrice)
    })

    // Show “+18% GST” only when displaying pre-tax amounts
    gstLabels.forEach(label => {
      label.style.display = includeGst ? 'none' : 'inline'
    })
  }

  // initialize based on current toggle state
  updatePrices(toggle.checked)

  toggle.addEventListener('change', (e) => {
    updatePrices(e.target.checked)
  })
})