/**
 * Script de prueba rápido para enviar email
 * Ejecutar con: node --loader tsx test-email.mjs
 */

async function testEmail() {
    try {
        console.log('🧪 Enviando email de prueba...')
        console.log('📧 Destinatario: jaimetr1309@gmail.com')

        const response = await fetch('http://localhost:3000/api/email/test?type=welcome&email=jaimetr1309@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const contentType = response.headers.get('content-type')
        console.log('\n📊 Status:', response.status)
        console.log('📄 Content-Type:', contentType)

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            console.log('\n✅ Respuesta:', JSON.stringify(data, null, 2))

            if (data.success) {
                console.log('\n🎉 ¡Email enviado exitosamente!')
                console.log('📬 Revisa tu bandeja de entrada: jaimetr1309@gmail.com')
                console.log('📧 ID del email:', data.result?.id)
            } else {
                console.log('\n❌ Error:', data.error)
            }
        } else {
            const text = await response.text()
            console.log('\n⚠️  Respuesta no es JSON (probablemente HTML)')
            console.log('Primeras 200 caracteres:', text.substring(0, 200))
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message)
    }
}

testEmail()
