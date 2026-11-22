import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notify } from '../../utils/notify'
import { useUserStore } from '../../store/userStore'

const interestOptions = [
  'Climate & Environment',
  'Biodiversity & Ecosystems',
  'Scientific Research',
  'Open Source & Public Infrastructure',
  'Space & Astronomy',
  'Social Good',
  'Education',
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const store = useUserStore()
  const [step, setStep] = useState(0)

  function finish() {
    if (store.username.trim().length < 3) {
      notify('Username required', 'Use at least 3 characters.', 'red')
      setStep(0)
      return
    }
    if (!store.country) {
      notify('Country required', 'Choose a country.', 'red')
      setStep(1)
      return
    }
    store.completeOnboarding()
    navigate('/projects')
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <div className="onboarding-brand"><span className="brand-mark">C</span><strong>Compute Commons</strong></div>
        <div className="step-progress"><span className="active" /><span className={step >= 1 ? 'active' : ''} /><span className={step >= 2 ? 'active' : ''} /></div>

        {step === 0 && (
          <div className="onboarding-step">
            <span>Step 1 of 3</span><h1>Create your profile</h1>
            <div className="native-segments" role="radiogroup" aria-label="Profile type">
              {(['Individual', 'Organisation'] as const).map((type) => (
                <button type="button" key={type} className={store.profileType === type ? 'active' : ''} onClick={() => store.setProfile({ profileType: type })}>{type}</button>
              ))}
            </div>
            <label className="native-field">Username<input required value={store.username} onChange={(event) => store.setProfile({ username: event.currentTarget.value })} /></label>
            {store.profileType === 'Organisation' && <label className="native-field">Organisation name<input required value={store.organisationName ?? ''} onChange={(event) => store.setProfile({ organisationName: event.currentTarget.value })} /></label>}
          </div>
        )}
        {step === 1 && (
          <div className="onboarding-step">
            <span>Step 2 of 3</span><h1>Choose your region</h1>
            <label className="native-field">Country
              <select required value={store.country} onChange={(event) => store.setProfile({ country: event.currentTarget.value })}>
                <option value="">Select a country</option>
                {['Germany','France','Denmark','Poland','Norway','Spain','Portugal','United Kingdom','United States','Brazil','Canada','India','Japan','Australia','South Africa','Other'].map((country) => <option key={country}>{country}</option>)}
              </select>
            </label>
            <label className="native-field">Region or state (optional)<input value={store.region ?? ''} onChange={(event) => store.setProfile({ region: event.currentTarget.value })} /></label>
          </div>
        )}
        {step === 2 && (
          <div className="onboarding-step">
            <span>Step 3 of 3</span><h1>Your contribution preferences</h1>
            <div className="native-check-grid">
              {interestOptions.map((interest) => (
                <label className="native-check" key={interest}>
                  <input type="checkbox" checked={store.interests.includes(interest as typeof store.interests[number])} onChange={() => store.updateInterests(store.interests.includes(interest as typeof store.interests[number]) ? store.interests.filter((item) => item !== interest) : [...store.interests, interest as typeof store.interests[number]])} />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
            <div className="native-check-grid compact">
              {['Mornings','Afternoons','Evenings'].map((period) => (
                <label className="native-check" key={period}>
                  <input type="checkbox" checked={store.availability.includes(period as typeof store.availability[number])} onChange={() => store.setProfile({ availability: store.availability.includes(period as typeof store.availability[number]) ? store.availability.filter((item) => item !== period) : [...store.availability, period as typeof store.availability[number]] })} />
                  <span>{period}</span>
                </label>
              ))}
            </div>
            <label className="native-check"><input type="checkbox" checked={store.prioritizeRenewableEnergy} onChange={(event) => store.setProfile({ prioritizeRenewableEnergy: event.currentTarget.checked })} /><span>Prioritize renewable energy</span></label>
            <label className="native-check"><input type="checkbox" checked={store.allowPostponement} onChange={(event) => store.setProfile({ allowPostponement: event.currentTarget.checked })} /><span>Allow tasks to wait for cleaner energy</span></label>
          </div>
        )}
        <div className="onboarding-actions">
          <button className="native-button secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Back</button>
          {step < 2 ? <button className="native-button" onClick={() => setStep((value) => value + 1)}>Continue</button> : <button className="native-button" onClick={finish}>Create profile</button>}
        </div>
      </section>
    </main>
  )
}
