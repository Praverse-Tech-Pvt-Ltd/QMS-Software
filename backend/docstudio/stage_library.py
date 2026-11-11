"""
Document Studio - dosage-form stage library (DRAFT, pending NexGen expert review).

Deterministic, expert-authored content: ordered manufacturing stages per dosage
form and the GMP records each stage must capture. This layer NEVER invents
product-specific numbers; limits come only from user-supplied parameters.

Each stage:
  key, title, instruction, records (fields to capture), critical (bool),
  ipqc (list of IPQC parameter names suggested for this stage).
Expert-review status lives in LIBRARY_STATUS and is surfaced in API output.
"""

LIBRARY_STATUS = {
    'version': '0.1-draft',
    'expert_reviewed': False,
    'note': 'Starter library; must be reviewed and approved by the NexGen quality lead before production use.',
}

_LINE_CLEARANCE = dict(
    key='line_clearance', title='Line clearance and area/equipment status check',
    instruction='Verify area and equipment are clean, labelled as cleaned and within cleaning hold time; '
                'verify no material or documents from the previous batch remain.',
    records=['Area ID', 'Equipment IDs', 'Cleaning status label / date', 'Checked by', 'Verified by (QA)'],
    critical=True, ipqc=[])

_DISPENSING = dict(
    key='dispensing', title='Dispensing of raw materials',
    instruction='Dispense each material against the approved bill of materials, verifying status, '
                'retest/expiry and balance calibration; second-person verification of each weighment.',
    records=['Material name / code', 'AR number', 'Required qty', 'Actual qty', 'Balance ID',
             'Dispensed by', 'Verified by'],
    critical=True, ipqc=[])

_COMMON_END = [
    dict(key='yield_reconciliation', title='Yield and reconciliation',
         instruction='Calculate actual yield against theoretical yield using the approved formula and record '
                     'reconciliation of all materials; investigate any result outside the approved limits.',
         records=['Theoretical yield', 'Actual yield', 'Yield %', 'Reconciliation of rejects/samples',
                  'Calculated by', 'Verified by'],
         critical=True, ipqc=[]),
    dict(key='batch_review', title='Batch record review and deviation summary',
         instruction='Production and QA review of the executed record; list all deviations, OOS/OOT results '
                     'and unplanned events with record numbers.',
         records=['Deviation numbers', 'Review by (Production)', 'Review by (QA)', 'Date'],
         critical=True, ipqc=[]),
]

LIBRARY = {
    'oral_solid_tablet': {
        'label': 'Oral solid dose - compressed tablet',
        'stages': [_LINE_CLEARANCE, _DISPENSING] + [
            dict(key='sifting', title='Sifting / milling',
                 instruction='Sift/mill materials through the specified screen; record screen size and integrity check before and after use.',
                 records=['Sieve/mill ID', 'Screen size', 'Integrity check before/after', 'Qty in / out'],
                 critical=False, ipqc=[]),
            dict(key='granulation', title='Granulation (dry / wet)',
                 instruction='Perform granulation per approved process parameters; record binder preparation, addition rate, mixing time and endpoint.',
                 records=['Equipment ID', 'Binder batch/prep details', 'Process parameters (speed, time, rate)', 'Endpoint observation'],
                 critical=True, ipqc=['Loss on drying']),
            dict(key='drying', title='Drying',
                 instruction='Dry to the specified endpoint; record inlet/outlet temperature and time.',
                 records=['Dryer ID', 'Inlet/outlet temperature', 'Start/stop time', 'LOD result'],
                 critical=True, ipqc=['Loss on drying']),
            dict(key='blending', title='Blending and lubrication',
                 instruction='Blend for the specified time and speed; record blender load and sampling.',
                 records=['Blender ID', 'Load qty', 'Speed / time', 'Sample taken'],
                 critical=True, ipqc=['Blend uniformity']),
            dict(key='compression', title='Compression',
                 instruction='Compress with specified tooling and parameters; sample at defined frequency.',
                 records=['Compression machine ID', 'Tooling set ID', 'Speed', 'Force', 'Start/stop time'],
                 critical=True,
                 ipqc=['Average weight', 'Individual weight variation', 'Thickness', 'Hardness', 'Friability', 'Disintegration time']),
            dict(key='coating', title='Coating (if applicable)',
                 instruction='Prepare coating dispersion; coat to the specified weight gain; record spray parameters.',
                 records=['Coater ID', 'Dispersion batch/prep', 'Spray rate / pan speed', 'Weight gain'],
                 critical=True, ipqc=['Weight gain']),
            dict(key='packing', title='Primary and secondary packing',
                 instruction='Issue and reconcile packaging components, verify printed material against approved specimen, record line-clearance and online checks.',
                 records=['Component code / AR', 'Issued / used / rejected / returned', 'Batch no./expiry/MRP overprint check', 'Packing line ID'],
                 critical=True, ipqc=['Seal integrity', 'Overprint legibility', 'Leak test']),
        ] + _COMMON_END,
    },
    'api_synthesis': {
        'label': 'API - chemical synthesis',
        'stages': [_LINE_CLEARANCE] + [
            dict(key='charging', title='Raw material and solvent charging',
                 instruction='Charge materials in the specified order and quantity to the cleaned, leak-tested reactor.',
                 records=['Reactor ID', 'Material / AR / qty', 'Order of addition', 'Charged by / verified by'],
                 critical=True, ipqc=[]),
            dict(key='reaction', title='Reaction',
                 instruction='Maintain the specified temperature and time; monitor to reaction completion using the specified IPC method.',
                 records=['Temperature log', 'Start/stop time', 'IPC sample time and result', 'Agitator speed'],
                 critical=True, ipqc=['Reaction completion (IPC)']),
            dict(key='workup', title='Work-up / extraction / phase separation',
                 instruction='Quench, extract and separate phases as specified; record volumes, pH and holding times.',
                 records=['pH', 'Volumes', 'Hold time', 'Layer disposition'],
                 critical=True, ipqc=['pH']),
            dict(key='crystallization', title='Crystallization / isolation',
                 instruction='Cool/seed as specified; centrifuge/filter; wash; record cake appearance.',
                 records=['Cooling profile', 'Centrifuge/filter ID', 'Wash volumes', 'Wet cake weight'],
                 critical=True, ipqc=['Particle appearance']),
            dict(key='drying', title='Drying',
                 instruction='Dry under specified conditions to endpoint.',
                 records=['Dryer ID', 'Temperature / vacuum', 'Start/stop time', 'LOD result'],
                 critical=True, ipqc=['Loss on drying', 'Residual solvents']),
            dict(key='milling_blending', title='Milling / sieving / blending',
                 instruction='Mill/sieve and blend to the specified particle size; record equipment and sampling.',
                 records=['Mill ID', 'Screen / speed', 'Blend uniformity sample'],
                 critical=False, ipqc=['Particle size distribution']),
            dict(key='packing', title='Packing and labelling',
                 instruction='Pack in the specified primary container with seal and label; record tare/net weights.',
                 records=['Container IDs', 'Tare / net weights', 'Label reconciliation'],
                 critical=True, ipqc=[]),
        ] + _COMMON_END,
    },
    'sterile_injectable_aseptic': {
        'label': 'Sterile injectable - aseptic fill',
        'stages': [_LINE_CLEARANCE] + [
            dict(key='gowning_ems', title='Aseptic area readiness and environmental status',
                 instruction='Confirm the aseptic area EM results for the shift are within limits and gowning qualification of personnel is current.',
                 records=['Area classification', 'EM status', 'Personnel gowning qualification current Y/N'],
                 critical=True, ipqc=['Viable/non-viable monitoring']),
            dict(key='compounding', title='Compounding',
                 instruction='Compound within the specified time; record WFI/solution temperatures and hold times.',
                 records=['Vessel ID', 'Material / qty', 'Temperature', 'Compounding start/stop'],
                 critical=True, ipqc=['pH', 'Assay (bulk)']),
            dict(key='filtration', title='Sterile filtration',
                 instruction='Verify pre-use integrity of the sterilising filter; filter within the specified bioburden hold; test post-use integrity.',
                 records=['Filter ID / lot', 'Pre-use integrity result', 'Post-use integrity result', 'Bioburden sample'],
                 critical=True, ipqc=['Filter integrity', 'Bioburden']),
            dict(key='filling', title='Aseptic filling and stoppering',
                 instruction='Fill under the specified conditions; record interventions; perform fill-volume checks at defined frequency.',
                 records=['Filling line ID', 'Fill volume checks', 'Interventions log', 'Start/stop time'],
                 critical=True, ipqc=['Fill volume', 'Particulate inspection', 'Container closure integrity']),
            dict(key='sealing_inspection', title='Sealing and 100% visual inspection',
                 instruction='Seal and inspect 100%; record rejects by defect category.',
                 records=['Inspector ID', 'Qty inspected', 'Rejects by category'],
                 critical=True, ipqc=['Visual defects']),
        ] + _COMMON_END,
    },
}


def available_forms():
    return [{'key': k, 'label': v['label'], 'stage_count': len(v['stages'])} for k, v in LIBRARY.items()]
